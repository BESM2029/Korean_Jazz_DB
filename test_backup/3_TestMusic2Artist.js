const MG = require("@mhhwang2002/MongoGraph");
const assert = require('chai').assert;
//const AG = require('../AGraph');
const MongoClient = require('mongodb').MongoClient ;
const KJDB = require("../Korean_Jazz_DB").KJDB;
const constructGraph = require("../Korean_Jazz_DB").constructGraph;

const AG = require('AGraph');

function get_id(docs, name)
{
  for(let ii in docs) {
    let doc = docs[ii];
    if(doc.name == name )
      return doc._id;
  }
  return null;
}

describe('Test Artist Contribution To Music', function(){
  let db_artists="Test_Artists_DB";
  let tbv_artists="artists";
  let db_musics = "Test_Musics_DB";
  let tbv_musics="musics";
  let tbe_artists2music = "artists2music";


    let db_url = 'mongodb://localhost:27017'; 

  let _musics=[];
  let _artists=[];

  let KJDBMngr = new KJDB.DBManager(db_url, "", "", "");

  it('Open DB Connection" ', async() => {  
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

  it('Get all Artists and Musics', async() => { 
    try{ 
      let results = await KJDBMngr.gdb.get(db_artists, tbv_artists, {});
      assert(results.length == 10);
      for(let ii in results)
        _artists.push(results[ii]);
      results = await KJDBMngr.gdb.get(db_musics, tbv_musics, {});
      assert(results.length == 10);
      for(let ii in results)
        _musics.push(results[ii]);
    }
    catch(err){
      console.log(err); 
      assert(0);
    }
  }); 

  it('Insert Artist Contribution 1', async() => {  
    //let KJDBMngr = new KJDB.DBManager(db_url, db_artists, tbv_artists, tbe_artists2matches);
    try{
      let member1_id = get_id(_artists, "Novak Djokovic"); assert(member1_id);
      let member1_contributions_music1 = ["COMP", "PIANO"];
      let member2_id = get_id(_artists, "Andy Murray"); assert(member2_id);
      let member2_contributions_music1 = ["LYLICS", "VOCAL"];
      let music1_id = get_id(_musics, "A"); assert(music1_id);
      let result = await KJDBMngr.insert_artist2music(db_artists, tbv_artists, member1_id, db_musics, tbv_musics, music1_id,
        member1_contributions_music1, true, db_musics, tbe_artists2music);
      assert(result.length == 1);
      result = await KJDBMngr.insert_artist2music(db_artists, tbv_artists, member2_id, db_musics, tbv_musics, music1_id,
        member2_contributions_music1, false, db_musics, tbe_artists2music);
      assert(result.length == 1);
    }
    catch(err){
      console.log(err); 
      assert(0);
    }
  });

  it('Check Artist Contribution 1', async() => {  
    //let KJDBMngr = new KJDB.DBManager(db_url, db_artists, tbv_artists, tbe_artists2matches);
    try{
      let search_condition = {name:"A"};
          let edge_table_list = [{db:db_musics, table:tbe_artists2music}];
          let albumInformation = await KJDBMngr.gdb.getInEV(db_musics, tbv_musics, search_condition, edge_table_list, true);
          let G = constructGraph(albumInformation)
        console.log(G.printGraphStructure());
      assert(1);
    }
    catch(err){
      console.log(err); 
      assert(0);
    }
  });

  it('Insert Artist Contribution 2', async() => {  
    //let KJDBMngr = new KJDB.DBManager(db_url, db_artists, tbv_artists, tbe_artists2matches);
    try{
      let member1_id = get_id(_artists, "Novak Djokovic"); assert(member1_id);
      let member1_contributions_music2 = ["COMP"];
      let member2_id = get_id(_artists, "Milos Raonic"); assert(member2_id);
      let member2_contributions_music2 = ["TRUMPET", "VOCAL"];
      let member3_id = get_id(_artists, "Dominic Thiem"); assert(member3_id);
      let member3_contributions_music2 = ["DRUM"];
      let member4_id = get_id(_artists, "Andy Murray"); assert(member4_id);
      let member4_contributions_music2 = ["LYLICS"];
      let music2_id = get_id(_musics, "B"); assert(music2_id);
      let result = await KJDBMngr.insert_artist2music(db_artists, tbv_artists, member1_id, db_musics, tbv_musics, music2_id,
        member1_contributions_music2, false, db_musics, tbe_artists2music);
      assert(result.length == 1);
      result = await KJDBMngr.insert_artist2music(db_artists, tbv_artists, member2_id, db_musics, tbv_musics, music2_id,
        member2_contributions_music2, true, db_musics, tbe_artists2music);
      assert(result.length == 1);
      result = await KJDBMngr.insert_artist2music(db_artists, tbv_artists, member3_id, db_musics, tbv_musics, music2_id,
        member3_contributions_music2, false, db_musics, tbe_artists2music);
      assert(result.length == 1);
      result = await KJDBMngr.insert_artist2music(db_artists, tbv_artists, member4_id, db_musics, tbv_musics, music2_id,
        member4_contributions_music2, false, db_musics, tbe_artists2music);
      assert(result.length == 1);
    }
    catch(err){
      console.log(err); 
      assert(0);
    }
  });

  it('Check Artist Contribution 2', async() => {  
    //let KJDBMngr = new KJDB.DBManager(db_url, db_artists, tbv_artists, tbe_artists2matches);
    try{
      let search_condition = {name:"B"};
          let edge_table_list = [{db:db_musics, table:tbe_artists2music}];
          let albumInformation = await KJDBMngr.gdb.getInEV(db_musics, tbv_musics, search_condition, edge_table_list, true);
          let G = constructGraph(albumInformation)
        console.log(G.printGraphStructure());
      assert(1);
    }
    catch(err){
      console.log(err); 
      assert(0);
    }
  });

  it('Close DB Connection" ', async() => {  
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









