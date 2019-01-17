const MG = require("@mhhwang2002/MongoGraph");
const assert = require('chai').assert;
//const AG = require('../AGraph');
const MongoClient = require('mongodb').MongoClient ;
const KJDB = require("../Korean_Jazz_DB").KJDB;
const constructGraph = require("../Korean_Jazz_DB").constructGraph;

const AG = require('AGraph');

function get_id(music_docs, music_name)
{
  for(let ii in music_docs) {
    let music = music_docs[ii];
    if(music.name == music_name )
      return music._id;
  }
  return null;
}

describe('Test Band Organization', function(){
  let db_musics = "Test_Musics_DB";
  let tbv_musics="musics";
  let tbv_albums="albums";
  let tbe_music2album="music2album";

    let db_url = 'mongodb://localhost:27017'; 

  var _musics=[];

    it('Delete a musics DB  ', async() => { 
    try{
      let client = await MongoClient.connect(db_url, { useNewUrlParser: true});
      let gdb = new MG.Graph(client, {print_out:true});
      gdb.begin_profiling("Main"); 
        await gdb.clearDB(db_musics);
        await client.close();  
        //assert(0);
      gdb.end_profiling();   
    }
    catch(err){
      console.log(err); 
      assert(0);
    } 
    finally{
    }
  });

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

  it('Create an musics table ', async() => { 
    try{ 
        let results = await KJDBMngr.insert_musics(db_musics, tbv_musics, [{name:"A"}, {name:"B"}, {name:"C"},
          {name:"D"}, {name:"E"}, {name:"F"}, {name:"G"}, {name:"H"}, {name:"I"}, {name:"J"}]);
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
   
  it('Create a album ', async() => {  
    //let KJDBMngr = new KJDB.DBManager(db_url, db_artists, tbv_artists, tbe_artists2matches);
    try{ 
      let music1_id = get_id(_musics, "A"); assert(music1_id); 
      let music2_id = get_id(_musics, "B"); assert(music2_id); 
      let music3_id = get_id(_musics, "C"); assert(music3_id); 
      let music4_id = get_id(_musics, "D"); assert(music4_id); 
      let musicsArray2D=[[music1_id, music2_id], [music3_id, music4_id]];
      let Album = {name:"Kingsman", how_many_cds: 2, releaseDate:new Date(1969,0,1) };
      let results = await KJDBMngr.insert_album(db_musics, tbv_albums, Album, tbv_musics, musicsArray2D, tbe_music2album);
      assert(results.length == 5); // one band two member edges. 
 
    }
    catch(err){
      console.log(err); 
      assert(0);
    }  
  });

  it('Search a album ', async() => {  
    //let KJDBMngr = new KJDB.DBManager(db_url, db_artists, tbv_artists, tbe_artists2matches);
    try{ 

      let search_condition = {name:"Kingsman"};
          let edge_table_list = [{db:db_musics, table:tbe_music2album}];
          let albumInformation = await KJDBMngr.gdb.getInEV(db_musics, tbv_albums, search_condition, edge_table_list);
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









