const MG = require("@mhhwang2002/MongoGraph");
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



  // it('Open DB Connection', async() => {  
  //   //let KJDBMngr = new KJDB.DBManager(db_url, db_artists, tbv_artists, tbe_artists2matches);
  //   try{  
  //     let b_result = await KJDBMngr.open_DB_connection();
  //     assert(b_result);
  //   }
  //   catch(err){
  //     console.log(err); 
  //     assert(0);
  //   }  
  // });

  async function get_disk_graph (disk) {
    let tune_ids = [];
    for (let ii in disk) {
      let tune = disk[ii];
      // checking if this tune exists.
      let search_cond = get_querry_object("title", tune.title, '$and');
      let results = await KJDBMngr.gdb.get(db_musics, tbv_musics, search_cond);
      if (results.length == 0) {
        let missing_tune = {title: tune.title, time: tune.time};
        await KJDBMngr.insert_musics(db_musics, tbv_musics, missing_tune);
        results = await KJDBMngr.gdb.get(db_musics, tbv_musics, search_cond);
      }
      if (results.length > 0) {
        let tune_db = results[0];
        tune_ids.push(tune_db._id);
        if (tune.contributions) {
          for (let key in tune.contributions) {
            let contributers_of_key = tune.contributions[key];
            for (let ci in contributers_of_key) {
              let contributer = contributers_of_key[ci];
              let search_cond = get_querry_object("name", contributer, '$and');
              results = await KJDBMngr.gdb.get(db_artists, tbv_artists, search_cond);
              if (results.length == 0) {
                let missing_artist = {name: contributer};
                await KJDBMngr.insert_artists(db_artists, tbv_artists, missing_artist);
                results = await KJDBMngr.gdb.get(db_artists, tbv_artists, search_cond);
              }
              if (results.length > 0) {
                let composer_db = results[0];
                let contribution = [key];
                let result = await KJDBMngr.insert_artist2music(db_artists, tbv_artists, composer_db._id, db_musics, tbv_musics, tune_db._id,
                contribution, true, db_musics, tbe_artists2music);
                assert(result.length == 1);
              }
            }
          }
        }
      }
    } // end of for (let ii in album_group)
    return tune_ids;
  }; //end of function create_bands

  async function get_album_graph(db_album) {

  try {
    let edge_table_list = [{db: db_musics, table: tbe_album2artist}];
    let album_doc = {};
    for (let key in db_album) {
      if (key == "title") {
        album_doc[key] = db_album[key];

      }
    }
    let AlbumBandInformation = await KJDBMngr.gdb.getOutEV(db_musics, tbv_albums, album_doc, edge_table_list);
    let G = constructGraph(AlbumBandInformation)
    console.log(G.printGraphStructure());
  }
  catch(err){
    console.log(err)
  }
  finally{
    console.log(JSON.stringify(album_contributions));
    console.log(JSON.stringify(album_doc));
  }

  }
//{db: db_musics, table: tbe_album2band}

  it('Get data from album table', async() => {
    try {
      await KJDBMngr.open_DB_connection();
      let db_albumS = await KJDBMngr.gdb.get(db_musics, tbv_albums);
      await KJDBMngr.close_DB_connection();
      console.log(JSON.stringify(db_albumS));
      await KJDBMngr.open_DB_connection();
      get_album_graph(db_albumS[0]);
      await KJDBMngr.close_DB_connection();
    }
    catch (err) {
      console.log(err); 
      assert(0);
    }
  });

  // it('Close DB Connection', async() => {
  //   //let KJDBMngr = new KJDB.DBManager(db_url, db_artists, tbv_artists, tbe_artists2matches);
  //   try{  
  //     let b_result = await KJDBMngr.close_DB_connection();
  //     assert(b_result);
  //   }
  //   catch(err){
  //     console.log(err); 
  //     assert(0);
  //   }  
  //  }); 
  
});