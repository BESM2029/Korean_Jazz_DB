const AG = require('AGraph');
var KJDB= {} // KJDB is an object. 

/**
  create a graph=(VE,E) from a set of DB records.
  The created graph has "_id", "_src", "_dst".
*/
KJDB.constructGraph = function (records) 
{
  var G = new AG.AGraph("_id", "_src", "_dst");
  var edgeRecords = [];
  if(records) {
    //-- step 1. add all vertices and collect edges. 
    for(var ii=0; ii<records.length;ii++){
      var record = records[ii];
      if (record._src && record._dst)  // edge 
        edgeRecords.push(record); 
      else 
        G.addVtx(record._id, record); 
    }
    //-- step 2. add all edges 
    for(var ii=0; ii<edgeRecords.length;ii++){
      var edge = edgeRecords[ii];
      var src = edge._src;
      var dst = edge._dst;
      G.addEdge(edge._id, src._id, dst._id, edge); 
    } 
  } 
  return G;
}

/**
  get a partial graph of a given player from a total graph allMatchesG.
  The created graph has "_id", "_src", "_dst".
*/
KJDB.getPlayerGraph = function(playerId, allMatchesG)
{
  var answerG = new AG.AGraph("_id", "_src", "_dst");
  //-- get players scores of matches  
  if(playerId in allMatchesG.VE) { // if playerId is in VE. 
    var playerScoreEdges = allMatchesG.getOutgoingEdges(playerId); 

    //-- add match first 
    for(var ii=0; ii<playerScoreEdges.length;ii++){
      var playerScoreEdge = playerScoreEdges[ii];
      var matchID = playerScoreEdge._dst._id; // destination is a match
      var matchEntity = allMatchesG.getEntity(matchID);
      answerG.addVtx(matchID, matchEntity);  

      var matchPlayerScoreEdges = allMatchesG.getIncomingEdges(matchID); // get all player's score edges for a match 
      //-- add each player's score for the match 
      for(var jj=0; jj<matchPlayerScoreEdges.length;jj++){
        var playerScoreEdge = matchPlayerScoreEdges[jj];
        var playerID = playerScoreEdge._src._id; // source is a player
        if(!(playerID in answerG.VE)){
          var playerEntity = allMatchesG.getEntity(playerID);
          answerG.addVtx(playerID, playerEntity);  
        }
        answerG.addEdge(playerScoreEdge._id, playerID, matchID, playerScoreEdge);  
      }
    }  
  } 
  return answerG;
}


const MG = require("@mhhwang2002/MongoGraph");
const MongoClient = require('mongodb').MongoClient ;
const SINGLES="SG";
const DOUBLES="DB";

/**
 * KJDB.DBManager constructor 
 * @constructor
 */
KJDB.DBManager = function(db_url, db_member_name, table_member_name, table_player2match_name){
  this.db_url = db_url, 
	//this.print_out = (options && options.print_out)?options.print_out:false,
	this.fname_stack=[], 
	this.db_players=db_member_name, // member db 
  this.tbv_players=table_member_name,   // member table 
  this.tbe_players2matches=table_player2match_name, // player 2 match table

  /**
  * open connection of this client
  */
  this.open_DB_connection= async function()
  {
    try{
        this.client = await MongoClient.connect(this.db_url, { useNewUrlParser: true});
        this.gdb = new MG.Graph(this.client,{print_out:true});
        return true;
    }
    catch(err){
        console.log(err.message);
        return false;
    }
  }

  /**
  * close connection of this client.
  */
  this.close_DB_connection = async function()
  {
      try{
          await this.client.close();  
          return true;
      }
      catch(err){
          console.log(err.message);
          return false;
      }
  }

  /**
  * db_name: db name for a league.
  * artist_table_name: collection name of artists to insert. 
  * artistArray: array of artist objects 
  */
  this.insert_artists = async function(db_name, artist_table_name, artistArray)
  {
    try{
      //let this.gdb = new MG.Graph(this.client,{print_out:true});
      this.gdb.begin_profiling("insert_artists");
        await this.gdb.insert(db_name, artist_table_name, artistArray);   
        //await this.client.close();  
      this.gdb.end_profiling();
    }
    catch(err){
      console.log(err);
    }
  }

  /**
  * db_name: db name for a league.
  * match_table_name: collection name of the match to insert.
  * player1_id, player2_id: MongogDB generating _ids.
  * scores1 & scores2: an same size Array of numbers.
  * date: date of the match
  */
  this.insert_band = async function(db_name, band_table_name, bandObject, artist_table_name, bandMemberObjIdArray, artist_band_edge_table_name)
  {
    try{ 
        //let this.gdb = new MG.Graph(this.client,{print_out:true});
        this.gdb.begin_profiling("insert_band");
            await this.gdb.insert(db_name, band_table_name, bandObject) ;
            let inserted_band = await this.gdb.getLastOne(db_name, band_table_name,{});  
            if( !inserted_band._id )  
                throw "ERROR insert(DB="+db_name+", table="+band_table_name+")"; 
           
            let edges=[]; // 
            let bandID=inserted_band._id;
            for(let ii in bandMemberObjIdArray) {
              let memberObjId = bandMemberObjIdArray[ii];

              let BandMemberEdge = {_src:{db:db_name, table:artist_table_name, _id: memberObjId},
               _dst:{db:db_name, table:band_table_name, _id: bandID}}; // put role, start/end time later 
              edges.push(BandMemberEdge);
          }      
            let results = await this.gdb.insertEdge(db_name, artist_band_edge_table_name, edges) ;
            if (results.ops.length != edges.length)
                throw "ERROR insertEdge (DB="+db_name+", table="+artist_band_edge_table_name+")";
            let result_total = [inserted_band].concat(results.ops);
            //await this.client.close();  
        this.gdb.end_profiling();
        return result_total;
      }
      catch(err){
          console.log(err);
      } 
  }
  this.insert_musics = async function(db_name, music_table_name, musicArray)
  {
    try{
      //let this.gdb = new MG.Graph(this.client,{print_out:true});
      this.gdb.begin_profiling("insert_musics");
        await this.gdb.insert(db_name, music_table_name, musicArray);
        //await this.client.close();  
      this.gdb.end_profiling();
    }
    catch(err){
      console.log(err);
    }
  }
  this.insert_album = async function(db_name, album_table_name, albumObject, music_table_name, includedMusicObjIdArray2D, music_album_edge_table_name)
  {
    try{ 
        //let this.gdb = new MG.Graph(this.client,{print_out:true});
        this.gdb.begin_profiling("insert_album");
            await this.gdb.insert(db_name, album_table_name, albumObject) ;
            let inserted_album = await this.gdb.getLastOne(db_name, album_table_name,{});  
            if( !inserted_album._id )  
                throw "ERROR insert(DB="+db_name+", table="+album_table_name+")"; 
            let edges=[]; // 
            let albumID=inserted_album._id;
            for(let cdi in includedMusicObjIdArray2D) {
              for (let tracki in includedMusicObjIdArray2D[cdi]) {
                let musicObjId = includedMusicObjIdArray2D[cdi][tracki];
                let albumMusicEdge = {_src:{db:db_name, table:music_table_name, _id: musicObjId}, _dst:{db:db_name, table:album_table_name, _id: albumID}, cd_number: cdi, track_number: tracki};  // how can put role?
                edges.push(albumMusicEdge);
              }
            }      
            let results = await this.gdb.insertEdge(db_name, music_album_edge_table_name, edges) ;
            if (results.ops.length != edges.length)
                throw "ERROR insertEdge (DB="+db_name+", table="+music_album_edge_table_name+")";
            let result_total = [inserted_album].concat(results.ops);
            //await this.client.close();  
        this.gdb.end_profiling();
        return result_total;
      }
      catch(err){
          console.log(err);
      } 
  }

  this.insert_artist2music = async function(artist_db, artist_table, artist_id, music_db, music_table, music_id, contributionsStringArray, bMainContributorFlag, artist2Music_db, artistMusicEdgeTableName)
  {
    try{ 
        //let this.gdb = new MG.Graph(this.client,{print_out:true});
        this.gdb.begin_profiling("insert_artist2music");
              let artist2MusicEdge = {_src:{db:artist_db, table:artist_table, _id: artist_id}, _dst: {db:music_db, table:music_table, _id: music_id}, contributions: contributionsStringArray};
              if (bMainContributorFlag) {
                artist2MusicEdge["mainContributor"] = 1;
              }
            let results = await this.gdb.insertEdge(artist2Music_db, artistMusicEdgeTableName, artist2MusicEdge) ;
            if (results.ops.length != 1)
                throw "ERROR insertEdge (DB="+artist2Music_db+", table="+artistMusicEdgeTableName+")";
            let result_total = results.ops;
            //await this.client.close();  
        this.gdb.end_profiling();
        return result_total;
      }
      catch(err){
          console.log(err);
      } 
  }
}

if (typeof module != 'undefined') // node
    module.exports = {KJDB:KJDB, constructGraph: KJDB.constructGraph}; //
