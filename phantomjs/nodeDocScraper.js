//scrape the node doc from http://nodejs.org/docs/latest/api/index.html

var docMeta = {};//store meta data scraped from node documentation
var URL = "http://nodejs.org/docs/latest/api/index.html";

//employ simple job/mechanism
var Job = function (url, func, obj) {
    this.url = url;
    this.func = func;
    this.obj = obj;
    Job.queue.push(this);
}

Job.queue = [];
Job.page = require('webpage').create();

Job.next = function () {
    var job = Job.queue.shift();
    if(job) {
	console.log("Opening "+job.url+"...")
	Job.page.open(job.url, function(status) {
	    if (status === "success") {
		console.log("Success!");
		job.func.call(job.obj,Job.page);
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
}

Job.onTerminate = function () {
    require('fs').write('./docMeta.json',JSON.stringify(docMeta),'w');
    console.log("done");
}

//first level scraping
var docLinkScraper = function (page) {
    docMeta = page.evaluate(function () {
	var listChild = document.querySelector('#toc ul').firstChild;
	var metaObj = {};
	while (listChild) {
	    //store doc ids
	    metaObj[listChild.textContent] = "http://nodejs.org/docs/latest/api/"
		+listChild.querySelector('a').getAttribute('href');
	    listChild = listChild.nextElementSibling;
	}
	return metaObj;
    });
    
    //TODO:crawling through urls
}

new Job(URL, docLinkScraper, docMeta);

Job.next();