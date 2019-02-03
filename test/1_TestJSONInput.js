const MG = require("@mhhwang2002/MongoGraph");
const assert = require('chai').assert;
//const AG = require('../AGraph');
const MongoClient = require('mongodb').MongoClient ;
const KJDB = require("../Korean_Jazz_DB").KJDB;
const constructGraph = require("../Korean_Jazz_DB").constructGraph;

const AG = require('AGraph');
const JSON_data = require('../data/JSON_data'); 

// exmaple: higher_key_name = 'name'
//          multi_language_string_object = {en: "HOO KIM", kr: "김영후"}
//          querry_object = {$and : [ { 'name.en' : "HOO KIM" }, { 'name.kr' : "김영후" }]}; 
function get_querry_object(higher_key_name, multi_language_string_object, operatorStr) 
{
	let valueArray = [];
	for(let key in multi_language_string_object) {
		let object = {};
		let hierarchical_key = higher_key_name + "." + key;
		object[hierarchical_key]=multi_language_string_object[key];
		valueArray.push(object);
	}
	// let querry_object = {'$and': valueArray};
	let querry_object = {};
	querry_object[operatorStr] = valueArray;
	return querry_object;
}

describe('Test DB from JSON Data ', function(){
 	let db_artists="Test_JSON_Artists_DB";
	let tbv_artists="artists";
	let tbv_bands="bands";
	let tbe_artist2band="artist2band";
  let db_musics = "Test_JSON_Musics_DB";
  let tbv_musics="musics";
  let tbv_albums="albums";
  let tbe_music2album="music2album";
  let tbe_artists2music = "artists2music";

    let db_url = 'mongodb://localhost:27017'; 

	var _artists=[];

    //let jsonStr = JSON.stringify(JSON_data);
    //console.log(jsonStr);

	it('Delete all DBs  ', async() => { 
		try{
			let client = await MongoClient.connect(db_url, { useNewUrlParser: true});
			let gdb = new MG.Graph(client, {print_out:true});
			gdb.begin_profiling("Main"); 
				await gdb.clearDB(db_artists);
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

async function create_a_band (album_group) {
	for (let ii in album_group) {
		let agroup = album_group[ii];
		let group_members = agroup.members;
		// checking missing artists
	  let missing_members=[];
		for (let mi in group_members) {
			let search_cond = get_querry_object("name", group_members[mi], '$and');
		  let results = await KJDBMngr.gdb.get(db_artists, tbv_artists, search_cond);
		  if (results.length == 0) {
				let member = {name:group_members[mi]};
				missing_members.push(member);
			}
		}
		// inserting missing artists
	  let results = await KJDBMngr.insert_artists(db_artists, tbv_artists, missing_members);
	  // retrieving artists
			let memberArray=[];
		for (let mi in group_members) {
	  	let search_cond = get_querry_object("name", group_members[mi], '$and');
		  let results = await KJDBMngr.gdb.get(db_artists, tbv_artists, search_cond);
		  assert(results.length == 1);
				memberArray.push(results[0]._id);
		}
		// creating a band
		let Band = {name:agroup.name, startDate:new Date(1967,0,1), BreakDate:new Date(1977,0,1) };
		results = await KJDBMngr.insert_band(db_artists, tbv_bands, Band, tbv_artists, memberArray, tbe_artist2band);
		assert(results.length == memberArray.length + 1); // 1 means the band itself.
		// validating results
		let search_condition = get_querry_object("name", agroup.name, '$and'); 
	  let edge_table_list = [{db:db_artists, table:tbe_artist2band}];
	  let BandInformation = await KJDBMngr.gdb.getInEV(db_artists, tbv_bands, search_condition, edge_table_list);
	  let G = constructGraph(BandInformation)
    console.log(G.printGraphStructure());
	} // end of for (let ii in album_group)
}; //end of function create_a_band

async function create_a_disk (disk) {
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
			if (tune.composer) {
				for (let ci in tune.composer) {
					let composer = tune.composer[ci];
					let search_cond = get_querry_object("name", composer, '$and');
					results = await KJDBMngr.gdb.get(db_artists, tbv_artists, search_cond);
					if (results.length == 0) {
						let missing_artist = {name: composer};
						await KJDBMngr.insert_artists(db_artists, tbv_artists, missing_artist);
						results = await KJDBMngr.gdb.get(db_artists, tbv_artists, search_cond);
					}
					if (results.length > 0) {
						let composer_db = results[0];
						let contribution = ["composer"];
						let result = await KJDBMngr.insert_artist2music(db_artists, tbv_artists, composer_db._id, db_musics, tbv_musics, tune_db._id,
        		contribution, true, db_musics, tbe_artists2music);
     			  assert(result.length == 1);
					}
				}
			}
			if (tune.instruments) {
				for (let key in tune.instruments) {
					let artists = tune.instruments[key];
					for (let ci in artists) {
						let artist = artists[ci];
						let search_cond = get_querry_object("name", artist, '$and');
						results = await KJDBMngr.gdb.get(db_artists, tbv_artists, search_cond);
						if (results.length == 0) {
							let missing_artist = {name: artist};
							await KJDBMngr.insert_artists(db_artists, tbv_artists, missing_artist);
							results = await KJDBMngr.gdb.get(db_artists, tbv_artists, search_cond);
						}
						if (results.length > 0) {
							let artist_db = results[0];
							let contribution = [key];
							let result = await KJDBMngr.insert_artist2music(db_artists, tbv_artists, artist_db._id, db_musics, tbv_musics, tune_db._id,
	        		contribution, true, db_musics, tbe_artists2music);
	     			  assert(result.length == 1);
						}
					}
				}
			}
		}
	} // end of for (let ii in album_group)
	return tune_ids;
}; //end of function create_a_band

	it('Create an band', async() => {
		try {
			for ( let di in JSON_data) {
				let album = JSON_data[di];
				if (album.group ) { // group
					await create_a_band(album.group);
				}
				let musicsArray2D=[];
				for (let di in album.disks) {
					let disk = album.disks[di];
					let tune_id_array = await create_a_disk(disk);
					musicsArray2D.push(tune_id_array);
				}
	      let Album = {title: album.title, release_date: album.release_date };
	      let results = await KJDBMngr.insert_album(db_musics, tbv_albums, Album, tbv_musics, musicsArray2D, tbe_music2album);
	      // assert(results.length == musicsArray2D.length + 1); // number of disks + 1
    	}
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