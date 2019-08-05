const MG = require("@mhhwang2002/MongoGraph");
const assert = require('chai').assert;
//const AG = require('../AGraph');
const MongoClient = require('mongodb').MongoClient ;
const KJDB = require("../Korean_Jazz_DB").KJDB;
const constructGraph = require("../Korean_Jazz_DB").constructGraph;

const AG = require('AGraph');

function get_id(player_docs, player_name)
{
	for(let ii in player_docs) {
		let player = player_docs[ii];
		if(player.name == player_name )
			return player._id;
	}
	return null;
}
describe('Test Band Organization', function(){
 	let db_artists="Test_Artists_DB";
	let tbv_artists="artists";
	let tbv_bands="bands";
	let tbe_artist2band="artist2band";

  let db_url = 'mongodb://localhost:27017'; 

	var _artists=[];

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

 	it('Create an artist table ', async() => { 
		try{ 
		    let results = await KJDBMngr.insert_artists(db_artists, tbv_artists, [{name:"Andy Murray"},{name:"Dominic Thiem"},{name:"Juan Martin del Potro"},
		    	{name:"Kevin Anderson"}, {name:"Marin Cilic"}, {name:"Milos Raonic"}, {name:"Novak Djokovic"}, {name:"Rafael Nadal"},
		    	{name:"Roger Federer"}, {name:"Stan Wawrinka"}]);
		    results = await KJDBMngr.gdb.get(db_artists, tbv_artists, {});
			assert(results.length == 10);
			for(let ii in results)
				_artists.push(results[ii]);
 
		}
		catch(err){
			console.log(err); 
			assert(0);
		}
	}); 


	it('Create a band ', async() => {  
		//let KJDBMngr = new KJDB.DBManager(db_url, db_artists, tbv_artists, tbe_artists2matches);
	 	try{ 
	 		let member1_id = get_id(_artists, "Novak Djokovic"); assert(member1_id); 
	 		let member2_id = get_id(_artists, "Andy Murray"); assert(member2_id);  
	 		let memberArray=[member1_id, member2_id];
	 		let Band = {name:"King", startDate:new Date(1967,0,1), BreakDate:new Date(1977,0,1) };
	 		let results = await KJDBMngr.insert_band(db_artists, tbv_bands, Band, tbv_artists, memberArray, tbe_artist2band);
	 		assert(results.length == 3); // one band two member edges. 
 
	 	}
	 	catch(err){
	 		console.log(err); 
	 		assert(0);
	 	}  
	}); 

    it('Search a band ', async() => {  
		//let KJDBMngr = new KJDB.DBManager(db_url, db_artists, tbv_artists, tbe_artists2matches);
	 	try{ 

	 		let search_condition = {name:"King"};
            let edge_table_list = [{db:db_artists, table:tbe_artist2band}];
            let BandInformation = await KJDBMngr.gdb.getInEV(db_artists, tbv_bands, search_condition, edge_table_list);
            let G = constructGraph(BandInformation)
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