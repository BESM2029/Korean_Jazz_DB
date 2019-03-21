const MG = require("@mhhwang2002/MongoGraph").MG;
const assert = require('chai').assert;
//const AG = require('../AGraph');
const MongoClient = require('mongodb').MongoClient ;
const KJDB = require("../Korean_Jazz_DB").KJDB;
const constructGraph = require("../Korean_Jazz_DB").constructGraph;

const AG = require('AGraph');
const JSON_data = require('../data/JSON_data');

describe('Test Get Data from DB', function() {

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

  function clearKeys(doc) {
    delete doc["_id"]; // MG.ky_id];
    delete doc["_db"]; // MG.ky_db];
    delete doc["_collection"]; // MG.ky_cl];
  }

  function standardization(str) {
    let a1int = parseInt(str) + 1;
    let a1str = a1int.toString();
    while (a1str.length < 2) {
      a1str = "0" + a1str;
    }
    return a1str;
  }

  async function getAlbumAndContributions(dbAlbum, jsonAlbum) {
    try {
      let contributionsContainer = {};
      let edgeLocation = [{db: db_musics, table: tbe_album2artist}];

      let cond = {};
      for (let key in dbAlbum) {
        if (key == "_id") {
          cond = dbAlbum[key];
        }
        else {
          jsonAlbum[key] = dbAlbum[key];
        }
      }
      let contributionEV = await KJDBMngr.gdb.getOutEV(db_musics, tbv_albums, cond, edgeLocation);
      let G = constructGraph(contributionEV);
      let contributions = G.getEdges();
      for (let ci in contributions) {
        let contribution = contributions[ci];
        let contributor = G.getEdgeDestination(contribution);
        if (!contributionsContainer[contribution.contributions[0]]) {
          contributionsContainer[contribution.contributions[0]] = [contributor.name];
        }
        else {
          contributionsContainer[contribution.contributions[0]].push(contributor.name);
        }
      }
      jsonAlbum.contributions = contributionsContainer;
    }
    catch (err) {
      console.log(err)
    }
    finally {
      return jsonAlbum;
    }
  }

  async function getGroupsAndMembers(dbAlbum, jsonAlbum) {
    try {
      let groupContainer = [];
      let edgeLocation1 = [{db: db_musics, table: tbe_album2band}];
      let edgeLocation2 = [{db: db_artists, table: tbe_artist2band}];

      let cond1 = {};
      for (let key in dbAlbum) {
        if (key == "_id") {
          cond1[key] = dbAlbum[key];
        }
      }
      let groupEV = await KJDBMngr.gdb.getOutEV(db_musics, tbv_albums, cond1, edgeLocation1, true);
      let G1 = constructGraph(groupEV);
      let groupEdges = G1.getEdges();
      for (let gi in groupEdges) {
        let groupEdge = groupEdges[gi];
        let group = G1.getEdgeDestination(groupEdge);
        groupContainer[gi] = group;
        groupContainer[gi].members = [];

        let cond2 = {_id: groupContainer[gi]._id};
        clearKeys(groupContainer[gi]);
        let groupMenberEV = await KJDBMngr.gdb.getInEV(db_artists, tbv_bands, cond2, edgeLocation2);
        let G2 = constructGraph(groupMenberEV);
        let memberEdges = G2.getEdges();
        for (let mi in memberEdges) {
          let memberEdge = memberEdges[mi];
          let member = G2.getEdgeSource(memberEdge);
          clearKeys(member);
          groupContainer[gi].members.push(member.name);
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

  async function getTunesAndContributions(dbAlbum, jsonAlbum) {
    try {
      let tunesContainer = [];
      let edgeLocation1 = [{db: db_musics, table: tbe_music2album}];
      let edgeLocation2 = [{db: db_musics, table: tbe_artists2music}];

      let cond1 = {};
      for (let key in dbAlbum) {
        if (key == "_id") {
          cond1[key] = dbAlbum[key];
        }
      }
      let tunesEV = await KJDBMngr.gdb.getInEV(db_musics, tbv_albums, cond1, edgeLocation1, true);
      let G1 = constructGraph(tunesEV);
      let tuneEdges = G1.getEdges();
      for (let ti in tuneEdges) {
        let tuneEdge = tuneEdges[ti];
        let tune = G1.getEdgeSource(tuneEdge);
        if (!tunesContainer[tuneEdge.cd_number]) {
          tunesContainer[tuneEdge.cd_number] = [];
        }
        tunesContainer[tuneEdge.cd_number][tuneEdge.track_number] = tune;
        tune.track = standardization(tuneEdge.track_number);
        tune.contributions = {};

        let cond2 = {_id: tune._id};
        clearKeys(tune);
        let tuneContributions = await KJDBMngr.gdb.getInEV(db_musics, tbv_musics, cond2, edgeLocation2);
        let G2 = constructGraph(tuneContributions);
        let contributionEdges = G2.getEdges();
        for (let ci in contributionEdges) {
          let contributionEdge = contributionEdges[ci];
          let contributor = G2.getEdgeSource(contributionEdge);
          clearKeys(contributor);
          if (!tune.contributions[contributionEdge.contributions]) {
            tune.contributions[contributionEdge.contributions] = [contributor.name];
          }
          else {
            tune.contributions[contributionEdge.contributions].push(contributor.name);
          }
        }
      }
      jsonAlbum.disks = tunesContainer;
    }
    catch (err) {
      console.log(err)
    }
    finally {
      return jsonAlbum;
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
      let jsonAlbums = [];
      let dbAlbums = await KJDBMngr.gdb.get(db_musics, tbv_albums);
      for (let ai in dbAlbums) {
        let ii = ai;
        let jsonAlbum = {};
        jsonAlbum = await getAlbumAndContributions(dbAlbums[ii], jsonAlbum);
        jsonAlbum = await getGroupsAndMembers(dbAlbums[ii], jsonAlbum);
        jsonAlbum = await getTunesAndContributions(dbAlbums[ii], jsonAlbum);
        jsonAlbums.push(jsonAlbum);
      }
      console.log("////////////////////////////////////////////////////////////////////////////////////////////////////////");
      console.log(JSON.stringify(jsonAlbums));
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