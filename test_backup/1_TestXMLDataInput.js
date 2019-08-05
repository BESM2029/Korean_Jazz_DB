const MG = require("@mhhwang2002/MongoGraph");
const assert = require('chai').assert;
//const AG = require('../AGraph');
const MongoClient = require('mongodb').MongoClient ;
const KJDB = require("../Korean_Jazz_DB").KJDB;
const constructGraph = require("../Korean_Jazz_DB").constructGraph;

let DOMParser = require('xmldom').DOMParser;
let domparser = new DOMParser({
    /**
     * locator is always need for error position info
     */
    locator:{},
    /**
     * you can override the errorHandler for xml parser
     * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
     */
    errorHandler:{warning:function(w){console.warn(w)},error:function(){},fatalError:function(){}}
    //only callback model
    //errorHandler:function(level,msg){console.log(level,msg)}
})

const fs = require('fs');
const xml = '<xml xmlns="a" xmlns:c="./lite">\n'+
        '\t<child>test</child>\n'+
        '\t<child></child>\n'+
        '\t<child/>\n'+
    '</xml>';

const AG = require('AGraph');

let _inputdata = null;
function get_id(player_docs, player_name)
{
	for(let ii in player_docs) {
		let player = player_docs[ii];
		if(player.name == player_name )
			return player._id;
	}
	return null;
}
describe('Test XML-based Data Input', function(){
 	let db_artists="Test_Artists_DB";
	let tbv_artists="artists";
	let tbv_bands="bands";
	let tbe_artist2band="artist2band";

    let db_url = 'mongodb://localhost:27017'; 

	let _artists=[];

    it('Test 1. parsing xml', async() => { 
    	console.log("xml:", xml);
		let dom = domparser.parseFromString(xml);
		assert(dom != null);
		let childNodes = dom.getElementsByTagName("child");
	});
	 
	it('Test 2. parsing Albums.xml', async() => { 
		let xmldata = fs.readFileSync('./data/Albums.xml','utf8');
		//console.log("err1:", err);
		console.log("xmldata:", xmldata);
		let dom = domparser.parseFromString(xmldata);
		let albumsNodes = dom.getElementsByTagName("album");
		let NoAlbums = albumsNodes.length;
		for(let ii in albumsNodes)
		{
			let node = albumsNodes[ii];

		}
		
        //console.log(dom.getElementById('myElement').innerHTML);  
	});
    
/*	it('Delete a artists DB  ', async() => { 
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
	*/

	  
  /*  console.log("Year \tTournament      \tWinner         \tRunner-up             \tScore"); 
	console.log("2015 \tAustralian      \tNovak Djokovic \tAndy Murray           \t7-6, 6-7, 6-3, 6-0");
	console.log("2015 \tFrench Open     \tStan Wawrinka  \tNovak Djokovic        \t4-6, 6-4, 6-3, 6-4");
	console.log("2015 \tWimbledon       \tNovak Djokovic \tRoger Federer         \t7-6, 6-7, 6-4, 6-3");
	console.log("2015 \tUP Open         \tNovak Djokovic \tRoger Federer         \t6-4, 5-7, 6-4, 6-4");

	console.log("2016 \tAustralian Open \tNovak Djokovic \tAndy Murray           \t6-1, 7-5, 7-6");
	console.log("2016 \tFrench Open     \tNovak Djokovic \tAndy Murray           \t3-6, 6-1, 6-2, 6-4");
	console.log("2016 \tWimbledon       \tAndy Murray    \tMilos Raonic          \t6-4, 7-6, 7-6");
	console.log("2016 \tUS Open         \tStan Wawrinka  \tNovak Djokovic        \t6-7(, 6-4, 7-5, 6-3");
 
	it('Insert 2016 Grand Slam Men\'s Finals \n \
		2016 \tAustralian Open \tNovak Djokovic \tAndy Murray           \t6-1, 7-5, 7-6\n \
		2016 \tFrench Open     \tNovak Djokovic \tAndy Murray           \t3-6, 6-1, 6-2, 6-4\n \
		2016 \tWimbledon       \tAndy Murray    \tMilos Raonic          \t6-4, 7-6, 7-6\n \
		2016 \tUS Open         \tStan Wawrinka  \tNovak Djokovic        \t6-7, 6-4, 7-5, 6-3" ', async() => {  
		//let KJDBMngr = new KJDB.DBManager(db_url, db_artists, tbv_artists, tbe_artists2matches);
	 	try{
	 		let winer_id = get_id(_artists, "Novak Djokovic"); assert(winer_id); 
	 		let opponent_id = get_id(_artists, "Andy Murray"); assert(opponent_id); 
	 		let date = new Date(2016,0,1)// month counst from 0 not 1. 
	 		let results = await KJDBMngr.insert_singles_match(db_Australian_Open, tbv_tennis_matches, winer_id, [6,7,7], opponent_id, [1,5,6], date );
	 		assert(results.length == 3); // one match two edges.
	 	 
	 		winer_id = get_id(_artists, "Novak Djokovic"); assert(winer_id); 
	 		opponent_id = get_id(_artists, "Andy Murray"); assert(opponent_id);  
	 		date = new Date(2016,4)// month counst from 0 not 1. 
	 		results = await KJDBMngr.insert_singles_match(db_French_Open, tbv_tennis_matches, winer_id, [3,6,6,6], opponent_id, [6,1,2,4], date );
	 		assert(results.length == 3); // one match two edges.
	 	 
	 		winer_id = get_id(_artists, "Andy Murray"); assert(winer_id); 
	 		opponent_id = get_id(_artists, "Milos Raonic"); assert(opponent_id);  
	 		date = new Date(2016,6)// month counst from 0 not 1. 
	 		results = await KJDBMngr.insert_singles_match(db_Wimbledon, tbv_tennis_matches, winer_id, [6,7,7], opponent_id, [4,6,6], date );
	 		assert(results.length == 3); // one match two edges. 
	 		
	 		winer_id = get_id(_artists, "Stan Wawrinka"); assert(winer_id); 
	 		opponent_id = get_id(_artists, "Novak Djokovic"); assert(opponent_id);  
	 		date = new Date(2016,8)// month counst from 0 not 1. 
	 		results = await KJDBMngr.insert_singles_match(db_US_Open, tbv_tennis_matches, winer_id, [6,6,7,6], opponent_id, [7,4,5,3], date );
	 		assert(results.length == 3); // one match two edges.
	 	}
	 	catch(err){
	 		console.log(err); 
	 		assert(0);
	 	}  
	 }); 
	
	console.log("2017 \tAustralian Open \tRoger Federer  \tRafael Nadal          \t6-4, 3-6, 6-1, 3-6, 6-3");
	console.log("2017 \tFrench Open     \tRafael Nadal   \tStan Wawrinka         \t6-2, 6-3, 6-1");
	console.log("2017 \tWimbledon       \tRoger Federer  \tMarin Cilic           \t6-3, 6-1, 6-4");
	console.log("2017 \tUS Open         \tRafael Nadal   \tKevin Anderson        \t6-3, 6-3, 6-4");
    it('Insert 2017 Grand Slam Men\'s Finals \n \
		2017 \tAustralian Open \tRoger Federer  \tRafael Nadal          \t6-4, 3-6, 6-1, 3-6, 6-3\n \
		2017 \tFrench Open     \tRafael Nadal   \tStan Wawrinka         \t6-2, 6-3, 6-1\n \
		2017 \tWimbledon       \tRoger Federer  \tMarin CiliC           \t6-3, 6-1, 6-4\n \
		2017 \tUS Open         \tRafael Nadal   \tKevin Anderson        \t6-3, 6-3, 6-4" ', async() => {  
		//let KJDBMngr = new KJDB.DBManager(db_url, db_artists, tbv_artists, tbe_artists2matches);
	 	try{
	 		let winer_id = get_id(_artists, "Roger Federer"); assert(winer_id); 
	 		let opponent_id = get_id(_artists, "Rafael Nadal"); assert(opponent_id); 
	 		let date = new Date(2017,0,1)// month counst from 0 not 1. 
	 		let results = await KJDBMngr.insert_singles_match(db_Australian_Open, tbv_tennis_matches, winer_id, [6,3,6,3,6], opponent_id, [4,6,1,6,3], date );
	 		assert(results.length == 3); // one match two edges.
	 	 
	 		winer_id = get_id(_artists, "Rafael Nadal"); assert(winer_id); 
	 		opponent_id = get_id(_artists, "Stan Wawrinka"); assert(opponent_id);  
	 		date = new Date(2017,4)// month counst from 0 not 1. 
	 		results = await KJDBMngr.insert_singles_match(db_French_Open, tbv_tennis_matches, winer_id, [6,6,6], opponent_id, [2,3,1], date );
	 		assert(results.length == 3); // one match two edges.
	 	 
	 		winer_id = get_id(_artists, "Roger Federer"); assert(winer_id); 
	 		opponent_id = get_id(_artists, "Marin Cilic"); assert(opponent_id);  
	 		date = new Date(2017,6)// month counst from 0 not 1. 
	 		results = await KJDBMngr.insert_singles_match(db_Wimbledon, tbv_tennis_matches, winer_id, [6,6,6], opponent_id, [3,1,4], date );
	 		assert(results.length == 3); // one match two edges. 
	 		
	 		winer_id = get_id(_artists, "Rafael Nadal"); assert(winer_id); 
	 		opponent_id = get_id(_artists, "Kevin Anderson"); assert(opponent_id);  
	 		date = new Date(2017,8)// month counst from 0 not 1. 
	 		results = await KJDBMngr.insert_singles_match(db_US_Open, tbv_tennis_matches, winer_id, [6,6,6], opponent_id, [3,3,4], date );
	 		assert(results.length == 3); // one match two edges.
	 	}
	 	catch(err){
	 		console.log(err); 
	 		assert(0);
	 	}  
	 }); 
	console.log("2018 \tAustralian Open \tRoger Federer  \tMarin Cilic           \t6-2, 6-7, 6-3, 3-6, 6-1"); 
	console.log("2018 \tFrench Open     \tRafael Nadal   \tDominic Thiem         \t6-4, 6-3, 6-2");
	console.log("2018 \tWimbledon       \tNovak Djokovic \tKevin Anderson        \t6-2, 6-2, 7-6");
	console.log("2018 \tUS Open         \tNovak Djokovic \tJuan Martin del Potro \t6-3, 7-6, 6-4");
	it('Insert 2018 Grand Slam Men\'s Finals \n \
		2018 \tAustralian Open \tRoger Federer  \tMarin Cilic           \t6-2, 6-7, 6-3, 3-6, 6-1\n \
		2018 \tFrench Open     \tRafael Nadal   \tDominic Thiem         \t6-4, 6-3, 6-2\n \
		2018 \tWimbledon       \tNovak Djokovic \tKevin Anderson        \t6-2, 6-2, 7-6\n \
		2018 \tUS Open         \tNovak Djokovic \tKevin Anderson \t6-3, 7-6, 6-4" ', async() => {  
		//let KJDBMngr = new KJDB.DBManager(db_url, db_artists, tbv_artists, tbe_artists2matches);
	 	try{
	 		let winer_id = get_id(_artists, "Roger Federer"); assert(winer_id); 
	 		let opponent_id = get_id(_artists, "Marin Cilic"); assert(opponent_id); 
	 		let date = new Date(2018,0,1)// month counst from 0 not 1. 
	 		let results = await KJDBMngr.insert_singles_match(db_Australian_Open, tbv_tennis_matches, winer_id, [6,6,6,3,6], opponent_id, [2,7,3,6,1], date );
	 		assert(results.length == 3); // one match two edges.
	 	 
	 		winer_id = get_id(_artists, "Rafael Nadal"); assert(winer_id); 
	 		opponent_id = get_id(_artists, "Dominic Thiem"); assert(opponent_id);  
	 		date = new Date(2018,4)// month counst from 0 not 1. 
	 		results = await KJDBMngr.insert_singles_match(db_French_Open, tbv_tennis_matches, winer_id, [6,6,6], opponent_id, [4,3,2], date );
	 		assert(results.length == 3); // one match two edges.
	 	 
	 		winer_id = get_id(_artists, "Novak Djokovic"); assert(winer_id); 
	 		opponent_id = get_id(_artists, "Kevin Anderson"); assert(opponent_id);  
	 		date = new Date(2018,6)// month counst from 0 not 1. 
	 		results = await KJDBMngr.insert_singles_match(db_Wimbledon, tbv_tennis_matches, winer_id, [6,6,7], opponent_id, [2,2,6], date );
	 		assert(results.length == 3); // one match two edges. 
	 		
	 		winer_id = get_id(_artists, "Novak Djokovic"); assert(winer_id); 
	 		opponent_id = get_id(_artists, "Kevin Anderson"); assert(opponent_id);  
	 		date = new Date(2018,7)// month counst from 0 not 1. 
	 		results = await KJDBMngr.insert_singles_match(db_US_Open, tbv_tennis_matches, winer_id, [3,6,4] , opponent_id, [6,7,6], date );
	 		assert(results.length == 3); // one match two edges.
	 	}
	 	catch(err){
	 		console.log(err); 
	 		assert(0);
	 	}  
	}); 

	it('Update 2018 Grand Slam Men\'s Finals \n \
		2018 \tUS Open         \tNovak Djokovic \tJuan Martin del Potro \t6-3, 7-6, 6-4" ', async() => {  
		//let KJDBMngr = new KJDB.DBManager(db_url, db_artists, tbv_artists, tbe_artists2matches);
	 	try{ 
	 		let winer_id = get_id(_artists, "Novak Djokovic"); assert(winer_id); 
	 		let opponent_id = get_id(_artists, "Juan Martin del Potro"); assert(opponent_id);  
	 		let wrongdate = new Date(2018,7)// month counst from 0 not 1. 
	 		let G = await KJDBMngr.find_singles_matches_G(db_US_Open, tbv_tennis_matches, winer_id, null, wrongdate, wrongdate); 
	 		let matches = G.getVtxs(function(entity) { return entity.date?true:false;}); // match vertice has date.  
	 		assert(matches.length == 1);
	 		let newDate =  new Date(2018,8);
	 		results = await KJDBMngr.update_singles_match(db_US_Open, tbv_tennis_matches, matches[0]._id, winer_id, [6,7,6], opponent_id, [3,6,4], newDate );
	 		//assert(results.length == 3); // one match two edges.
	 	}
	 	catch(err){
	 		console.log(err); 
	 		assert(0);
	 	}  
	}); 

	it('Find final matches of "Federer" in Grand Slams 2015 to 2018', async() => { 
		try{ 
			//let KJDBMngr = new KJDB.DBManager(db_url, db_artists, tbv_artists, tbe_artists2matches);
			let player_id = get_id(_artists, "Roger Federer"); assert(player_id);   
			var GrandSlamDB = [db_Australian_Open, db_French_Open, db_Wimbledon, db_US_Open];
			var GrandSlamFinals={}
			for(let ii in GrandSlamDB) {
				let db = GrandSlamDB[ii];
				let G = await KJDBMngr.find_singles_matches_G(db, tbv_tennis_matches, player_id, null, new Date(2015,0), new Date(2018,11)); 
				GrandSlamFinals[db] = G;
			} 

			for (let db in GrandSlamFinals) {
				let G = GrandSlamFinals[db];
				let matches = G.getOutgoingEdgeDestinations(player_id);   
				for(let mi in matches){
					let match = matches[mi];
					console.log(db+" Final Macht=", match);
					let inE = G.getIncomingEdges(match);
					for(let ei in inE) {
						let edge = inE[ei];
						let player = G.getEdgeSource(edge); 
						console.log("\t Player=", player.name, ", Score=", edge.scores);
					}
				}
			}
		}
		catch(err){
			console.log(err); 
			assert(0);
		}  
	}); 
	it('Find final matches of "Federer" against "Djokovic" in Grand Slams 2015 to 2018', async() => { 
		try{ 
			//let KJDBMngr = new KJDB.DBManager(db_url, db_artists, tbv_artists, tbe_artists2matches);
			let player_id = get_id(_artists, "Roger Federer"); assert(player_id);   
			let opponent_id = get_id(_artists, "Novak Djokovic"); assert(opponent_id);   
			var GrandSlamDB = [db_Australian_Open, db_French_Open, db_Wimbledon, db_US_Open];
			var GrandSlamFinals={}
			for(let ii in GrandSlamDB) {
				let db = GrandSlamDB[ii];
				let G = await KJDBMngr.find_singles_matches_G(db, tbv_tennis_matches, player_id, opponent_id, new Date(2015,0), new Date(2018,11)); 
				GrandSlamFinals[db] = G;
			} 

			for (let db in GrandSlamFinals) {
				let G = GrandSlamFinals[db];
				let matches = G.getOutgoingEdgeDestinations(player_id);   
				for(let mi in matches){
					let match = matches[mi];
					console.log(db+" Final Macht=", match);
					let inE = G.getIncomingEdges(match);
					for(let ei in inE) {
						let edge = inE[ei];
						let player = G.getEdgeSource(edge); 
						console.log("\t Player=", player.name, ", Score=", edge.scores);
					}
				}
			}
		}
		catch(err){
			console.log(err); 
			assert(0);
		}  
	}); 
	it('Find final matches of Grand Slams 2015 to 2018', async() => { 
		try{ 
			//let KJDBMngr = new KJDB.DBManager(db_url, db_artists, tbv_artists, tbe_artists2matches); 
			var GrandSlamDB = [db_Australian_Open, db_French_Open, db_Wimbledon, db_US_Open];
			var GrandSlamFinals={}
			for(let ii in GrandSlamDB) {
				let db = GrandSlamDB[ii];
				let G = await KJDBMngr.find_singles_matches_G(db, tbv_tennis_matches, null, null, new Date(2015,0), new Date(2018,11)); 
				GrandSlamFinals[db] = G;
			} 

			for (let db in GrandSlamFinals) {
				console.log("################ <" + db + "> ####################");
				let G = GrandSlamFinals[db];
				let matches = G.getVtxs(function(entity) { return entity.date?true:false;}); // match vertice has date.  
				for(let mi in matches){
					let match = matches[mi];
					console.log(" Final Macht=", match);
					let inE = G.getIncomingEdges(match);
					for(let ei in inE) {
						let edge = inE[ei];
						let player = G.getEdgeSource(edge); 
						console.log("\t Player=", player.name, ", Score=", edge.scores);
					}
				}
				console.log("################# End of <" + db + "> ######################");
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
*/
});