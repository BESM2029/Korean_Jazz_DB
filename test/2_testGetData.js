const MG = require("@mhhwang2002/MongoGraph").MG;
const assert = require('chai').assert;
//const AG = require('../AGraph');
const MongoClient = require('mongodb').MongoClient ;
const KJDB = require("../Korean_Jazz_DB").KJDB;
const constructGraph = require("../Korean_Jazz_DB").constructGraph;

const AG = require('AGraph');
const JSON_data = require('../data/JSON_data');

describe('Test Get Data from DB', function(){

  let db_artists="Test_JSON_Artists_DB";
  let tbv_artists="artists";
  let tbv_bands="bands";
  let tbe_artist2band="artist2band";
  let db_musics = "Test_JSON_Musics_DB";
  let tbv_musics="musics";
  let tbv_albums="albums";
  let tbe_music2album="music2album";
  let tbe_artists2music = "artists2music";
  let tbe_album2band = "album2band";
  let tbe_album2artist = "album2artist";

  let db_url = 'mongodb://localhost:27017'; 

  let KJDBMngr = new KJDB.DBManager(db_url, "", "", "");

  async function getAlbumContributionsGraph(dbAlbum, jsonAlbum) {
    try {
      console.log("dbAlbum = " + JSON.stringify(dbAlbum));
      let albumCdt = {};
      for (let key in dbAlbum) {
        if (key == "_id") {
          console.log("dbAlbum." + key + " = " + JSON.stringify(dbAlbum[key]));
          albumCdt[key] = dbAlbum[key];
        }
        else {
          jsonAlbum[key] = dbAlbum[key];
        }
      }
      console.log("albumCdt = " + JSON.stringify(albumCdt));
      let edgeLocation = [{db: db_musics, table: tbe_album2artist}];
      let contributionsInformation = await KJDBMngr.gdb.getOutEV(db_musics, tbv_albums, albumCdt, edgeLocation);
      let G = constructGraph(contributionsInformation);
      console.log(G.printGraphStructure());
      let container = {};
      let contributionS = G.getEdges();
      for (let ci in contributionS) {
        let contribution = contributionS[ci];
        let contributor = G.getEdgeDestination(contribution);
        console.log(JSON.stringify(contribution) + "==>" + JSON.stringify(contributor));
        if (!container[contribution.contributions[0]]) {
          container[contribution.contributions[0]] = [contributor.name];
        }
        else {
          container[contribution.contributions[0]].push(contributor.name);
        }
      }
      console.log("container = " + JSON.stringify(container));
      jsonAlbum.contributions = container;
    }
    catch (err) {
      console.log(err)
    }
    finally {
      return jsonAlbum;
    }
  }

  function clearKeys(doc) {
    delete doc["_id"]; // MG.ky_id];
    delete doc["_db"]; // MG.ky_db];
    delete doc["_collection"]; // MG.ky_cl];
  }

  async function getGroupGraph(db_album, jsonAlbum) {
    try {
      console.log("db_album = " + JSON.stringify(db_album));
      let album_doc = {};
      for (let key in db_album) {
        if (key == "_id") {
          console.log("db_album." + key + " = " + JSON.stringify(db_album[key]));
          album_doc[key] = db_album[key];
        }
      }
      console.log("album_doc = " + JSON.stringify(album_doc));
      let edgeLocation = [{db: db_musics, table: tbe_album2band}];
      let groupInformation = await KJDBMngr.gdb.getOutEV(db_musics, tbv_albums, album_doc, edgeLocation, true);
      let G = constructGraph(groupInformation);
      console.log(G.printGraphStructure());
      let groupContainer = [];
      let groupEdgeS = G.getEdges();
      for (let gi in groupEdgeS) {
        let groupEdge = groupEdgeS[gi];
        let group = G.getEdgeDestination(groupEdge);
        console.log(JSON.stringify(groupEdge) + "==>" + JSON.stringify(group));
        groupContainer[gi] = group;
        // delete groupContainer[gi]._id;
        groupContainer[gi].members = [];
      }
      let artist2band_edge_table_list = [{db: db_artists, table: tbe_artist2band}];
      for (let gi in groupContainer) {
        let group_doc_ext = groupContainer[gi];
        console.log("group_doc_ext = " + JSON.stringify(group_doc_ext));
        let cond = {_id: group_doc_ext._id};
        clearKeys(group_doc_ext);
        let groupMenberInformation = await KJDBMngr.gdb.getInEV(db_artists, tbv_bands, cond, artist2band_edge_table_list);
        let H = constructGraph(groupMenberInformation);
        console.log(H.printGraphStructure());
        let memberEdgeS = H.getEdges();
        for (let mi in memberEdgeS) {
          let memberEdge = memberEdgeS[mi];
          let member = H.getEdgeSource(memberEdge);
          console.log(JSON.stringify(memberEdge) + "==>" + JSON.stringify(member));
          clearKeys(member);
          group_doc_ext.members.push(member.name);
        }
      }
      jsonAlbum.group = groupContainer;
    }
    catch (err) {
      console.log(err)
    }
    finally {
      return jsonAlbum;
    }
  }

  async function get_tunes_graph(db_album) {
    try {
      let album_doc = {};
      for (let key in db_album) {
        if (key == "_id") {
          console.log("db_album." + key + " = " + JSON.stringify(db_album[key]));
          album_doc[key] = db_album[key];
        }
      }
      let edge_table_list = [{db: db_musics, table: tbe_music2album}];
      let tunesInformation = await KJDBMngr.gdb.getInEV(db_musics, tbv_albums, album_doc, edge_table_list);
      let G = constructGraph(tunesInformation)
      console.log(G.printGraphStructure());
      let tunes_docS = [];
      for (let ii in tunesInformation) {
        let element = tunesInformation[ii];
        if (element.title) {
          tunes_docS.push(element);
        }
      }
      console.log("tunes_docS = " + JSON.stringify(tunes_docS));
      let artist2tune_edge_table_list = [{db: db_musics, table: tbe_artists2music}];
      for (let ti in tunes_docS) {
        let tunes_doc = tunes_docS[ti];
        console.log("tunes_doc = " + JSON.stringify(tunes_doc));
        let tuneContributionsInformation = await KJDBMngr.gdb.getInEV(db_musics, tbv_musics, tunes_doc, artist2tune_edge_table_list);
        let H = constructGraph(tuneContributionsInformation);
        console.log(H.printGraphStructure());
      }
    }
    catch (err) {
      console.log(err)
    }
    finally {
    }
  }

  it('Open DB Connection', async() => {  
    //let KJDBMngr = new KJDB.DBManager(db_url, db_artists, tbv_artists, tbe_artists2matches);
    try{  
      let b_result = await KJDBMngr.open_DB_connection();
      assert(b_result);
    }
    catch(err){
      console.log(err); 
      assert(0);
    }  
  });

  it('Get data from album table', async() => {
    try {
      let dbAlbumS = await KJDBMngr.gdb.get(db_musics, tbv_albums);
      let jsonAlbumS = {}
      // for (let ai in dbAlbumS) {
        let jsonAlbum = {}
        // let resultA = await getAlbumContributionsGraph(dbAlbumS[0], jsonAlbum);
        // console.log("resultA = " + JSON.stringify(resultA));
        let resultG = await getGroupGraph(dbAlbumS[0], jsonAlbum);
        console.log("resultG = " + JSON.stringify(resultG));
        // let resultT = await getTunesGraph(dbAlbumS[0], jsonAlbum);
        // console.log("resultT = " + JSON.stringify(resultT));
      // }
    }
    catch (err) {
      console.log(err); 
      assert(0);
    }
  });

  it('Close DB Connection', async() => {
    //let KJDBMngr = new KJDB.DBManager(db_url, db_artists, tbv_artists, tbe_artists2matches);
    try{  
      let b_result = await KJDBMngr.close_DB_connection();
      assert(b_result);
    }
    catch(err){
      console.log(err); 
      assert(0);
    }  
   }); 
  
});