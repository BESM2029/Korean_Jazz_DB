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
function get_querry_object(higher_key_name, multi_language_string_object) 
{

	let valueArray = [];
	for(let key in multi_language_string_object) {
		let object = {};
		let hierarchical_key = higher_key_name + "." + key;
		object[hierarchical_key]=multi_language_string_object[key];
		valueArray.push(object);
	}
	let querry_object = {'$and': valueArray};
	return querry_object;
}

describe('Test DB from JSON Data ', function(){
 	let db_artists="Test_JSON_Artists_DB";
	let tbv_artists="artists";
	let tbv_bands="bands";
	let tbe_artist2band="artist2band";

    let db_url = 'mongodb://localhost:27017'; 

	var _artists=[];

    //let jsonStr = JSON.stringify(JSON_data);
    //console.log(jsonStr);

	it('Delete a artists DB  ', async() => { 
		try{
			let client = await MongoClient.connect(db_url, { useNewUrlParser: true});
			let gdb = new MG.Graph(client, {print_out:true});
			gdb.begin_profiling("Main"); 
				await gdb.clearDB(db_artists);
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
 

 	it('Create an album', async() => { 
		try{  
			let album = JSON_data[0];
			if(album.group) // group 
			{
				for(let ii in album.group)
				{
					let agroup = album.group[ii]; 
					let group_members = agroup.members;
					// create artists 
				    let members=[];
					for (let mi in group_members)
					{
						let member = {name:group_members[mi]};
						members.push(member);
					}
				    let results = await KJDBMngr.insert_artists(db_artists, tbv_artists, members);
				   
 					let memberArray=[];
					for (let mi in group_members)
					{
                    	let search_cond = get_querry_object("name", group_members[mi]); 
					    let results = await KJDBMngr.gdb.get(db_artists, tbv_artists, search_cond);
					    assert(results.length == 1); 
			 			memberArray.push(results[0]._id);
			 		} 
			 		let Band = {name:agroup.name, startDate:new Date(1967,0,1), BreakDate:new Date(1977,0,1) };

			 		results = await KJDBMngr.insert_band(db_artists, tbv_bands, Band, tbv_artists, memberArray, tbe_artist2band);
			 		assert(results.length == memberArray.length + 1); // 1 means the band itself.  
		 

		 			let search_condition =get_querry_object("name", agroup.name); 
		            let edge_table_list = [{db:db_artists, table:tbe_artist2band}];
		            let BandInformation = await KJDBMngr.gdb.getInEV(db_artists, tbv_bands, search_condition, edge_table_list);

		            let G = constructGraph(BandInformation)
		 		    console.log(G.printGraphStructure());
				}  
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