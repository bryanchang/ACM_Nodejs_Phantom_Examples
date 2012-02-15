//scrape CS Class schedule from http://www.registrar.ucla.edu/schedule/crsredir.aspx?termsel=12S&subareasel=COM+SCI

var docMeta = {};//store meta data
var mainURL = "http://www.registrar.ucla.edu/schedule/detselect.aspx?termsel=12S&subareasel=COM+SCI&idxcrs=";

var URLSuffixes = {
    "cs31":"0031++++",
    "cs32":"0032++++",
    "cs33":"0033++++",
    "cs35l":"0035L+++",
    "csm51a":"0051A+M+",
    "cs111":"0111++++",
    "cs112":"0112++++",
    "cs118":"0118++++",
    "csCM124":"0124++CM",
    "cs130":"0130++++",
    "cs131":"0131++++",
    "cs133":"0133++++",
    "cs143":"0143++++",
    "csM151B":"0151B+M+",
    "cs151c":"0151C+++",
    "csM152A":"0152A+M+",
    "cs161":"0161++++",
    "csM171L":"0171L+M+",
    "cs174a":"0174A+++",
    "cs181":"0181++++"
};//incomplete, enough for demo

//employ a simple job/mechanism
var Job = function (url, func, obj, classTitle) {
    this.url = url;
    this.func = func;
    this.obj = obj;
    this.classTitle = classTitle;
    Job.queue.push(this);
};

Job.queue = [];
Job.page = require('webpage').create();

//shift out next request
Job.next = function () {
    var job = Job.queue.shift();
    if(job) {
	console.log("Opening "+job.url+"...")
	    Job.page.open(job.url, function(status) {
		    if (status === "success") {
			console.log("Success!");
			job.func.call(job.obj,Job.page,job.classTitle);
			Job.next();
		    }
		    else {
			//reconnect
			console.log("Retrying");
			Job.queue.unshift(job);
			Job.next();
		    }
		})
	    }
    else{
	if (Job.onTerminate) Job.onTerminate();
	phantom.exit();
    }
};

//terminate
Job.onTerminate = function () {
    require('fs').write('../nodejs_examples/meta/UCLACSClass.json',JSON.stringify(docMeta),'w');
    console.log("done");
};

//scrape the decription 
var scraper = function(page, title) {
    
    this[title] = page.evaluate(function() {
	    var courseObj = {};
	    //class status
	    courseObj.status = document.querySelector('#ctl00_BodyContentPlaceHolder_detselect_ctl02_ctl02_Status').textContent.replace(/\s/g,"");
	    //class description
	    courseObj.des = document.querySelector('#ctl00_BodyContentPlaceHolder_detselect_lblClassNotes').textContent;
	    return courseObj;
	});
};

//create new jobs
var key;
for (key in URLSuffixes) {
    new Job(mainURL+URLSuffixes[key], scraper, docMeta, key);
}


//initiate data scraping
Job.next();