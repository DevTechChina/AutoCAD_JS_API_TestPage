function getSysvar()
{
	var sysvarname = document.getElementById('sysvarname').value;
	var sysvar = Acad.SystemVariableCollection.getSystemVariable(sysvarname);
	document.getElementById('sysvarvalue').value = sysvar.value;
}

function setSysvar()
{
	var sysvarname = document.getElementById('sysvarname').value;
    var sysvar = Acad.SystemVariableCollection.getSystemVariable(sysvarname);
	var sysnewvalue = document.getElementById('sysvarvalue').value;

	sysvar.postValue(sysnewvalue);
}

function execCircle()
{
	Acad.Editor.executeCommand('._Circle 0,0,0 10');
	var colName = 'LAYER';
	var results;
	Acad.DataItemCollectionManager.getKnownCollection(colName).then(function onSuccess(retvalue){
			 for (var index = 0; index < retvalue.dataItems.length; ++index) {
				alert(retvalue.dataItems[index].name);
			}
	}
	,function onError(ret){});
	 
}


function getLayer()
{	 
	var colName = 'LAYER';
	var results;
	Acad.DataItemCollectionManager.getKnownCollection(colName).then(function onSuccess(retvalue){
			 for (var index = 0; index < retvalue.dataItems.length; ++index) {
				alert(retvalue.dataItems[index].name);
			}
	}
	,function onError(ret){});
	 
}

function getDouble()
{
    var options = new Acad.PromptDoubleOptions('');

	var messageAndKeywords = 'Input Double [Rectangle/Circle/Line]:';
    var globalKeywords = 'Rectangle Circle Line';

    options.setMessageAndKeywords(messageAndKeywords, globalKeywords);
	
	  Acad.Editor.getDouble(options).then(
        function onCompletePromptStringResult(jsonPromptResult) {
		 var resObj =  jsonPromptResult;
			if (resObj) { 

				if (resObj.status == 5100) { // normal (string entered)
					document.getElementById('testTextArea').innerHTML  = 'normal:' + resObj.value.toString();					 
				} else if (resObj.status == -5005) { // keyword/arbitrary input
					document.getElementById('testTextArea').innerHTML = 'keyword/arbitrary: ' + resObj.stringResult;
 				} else if (resObj.status == 5000) { // Enter/Space key (null input)
					document.getElementById('testTextArea').innerHTML = 'enter/space: ' + resObj.stringResult;
				} else if (resObj.status == -5002) { // Cancel
					document.getElementById('testTextArea').innerHTML = 'cancel: ' +resObj.stringResult;
				} else {
					document.getElementById('testTextArea').innerHTML = '???';
				}
			}
		},
        function onErrorPromptResult(ret){});
	
}

 
function getEntity()
{
	var options = new Acad.PromptEntityOptions();
	  
	var messageAndKeywords = 'Input Entity [Rectangle/Circle/Line]:';
    var globalKeywords = 'Rectangle Circle Line';

    options.setMessageAndKeywords(messageAndKeywords, globalKeywords);
	  
	  Acad.Editor.getEntity(options).then(
            function onComplete(jsonPromptResult){
			      var resObj =  jsonPromptResult;
				 if (resObj) {    

					if (resObj.status == 5100) { // normal (point selected/entered) 
						document.getElementById('testTextArea').innerHTML = 'object id : ' + resObj.objectId.toString() + '\n';
					 
						//convert ads_name to objectID
						var oid = jsonPromptResult.objectId
						var hexString = oid.toString(16);
						//objectID
						oid = parseInt(hexString, 16);
						var thisEnt = new Acad.DBEntity(hexString); 
						//get
						var props = thisEnt.getProperties();
						
						if(props.IsA == "AcDbCircle")
						{
							var outStr = "\ncenter: " + props.Center;
							outStr += "\nradius: " + props.Radius;
							outStr += "\nArea: " + props.Area;
							outStr += "\nColor: " + props.Color;
							document.getElementById('testTextArea').innerHTML += outStr;
						}
						
					} else if (resObj.status == -5005) { // keyword/arbitrary input
					document.getElementById('testTextArea').innerHTML = 'keyword/arbitrary: ' + resObj.stringResult;
					} else if (resObj.status == 5000) { // Enter/Space key (null input)
						document.getElementById('testTextArea').innerHTML = 'enter/space: ' + resObj.stringResult;
					} else if (resObj.status == -5002) { // Cancel
						document.getElementById('testTextArea').innerHTML = 'cancel: ' +resObj.stringResult;
					} else {
						document.getElementById('testTextArea').innerHTML = '???';
					}
				}
			}, 
            function onError(ret){});
}


var observedEntities = new Acad.OSet();
function startReactor()
{
	var options = new Acad.PromptEntityOptions();
    options.setMessageAndKeywords("\nSelect an Entity", "");
    options.rejectMessage = "\nInvalid selection...";

    options.singlePickInSpace = true;
    options.allowObjectOnLockedLayer = true; 
	
	  Acad.Editor.getEntity(options).then(
            function onComplete(jsonPromptResult){
			      var resObj =  jsonPromptResult;
				 if (resObj) {    

					if (resObj.status == 5100) { // normal (point selected/entered) 
						document.getElementById('testTextArea').innerHTML = 'object id : ' + resObj.objectId.toString() + '\n';
					 
						observedEntities.clear();
						observedEntities.add(jsonPromptResult.objectId); 
						
						  Acad.Application.activedocument.startObserving(
							observedEntities, 
							Acad.Application.activedocument.eventname.modified, 
							onObjectModified);
					} 
				}
			}, 
            function onError(ret){});
}

function onObjectModified(eventname, args) 
{
    var entity = new Acad.DBEntity(args.id);
	document.getElementById('testTextArea').innerHTML ="Object Modified: "  + args.id;
	
	//convert ads_name to objectID
	var oid =  args.id;
	var hexString = oid.toString(16);
	//objectID
	oid = parseInt(hexString, 16);
	var thisEnt = new Acad.DBEntity(hexString); 
	//get
	var props = thisEnt.getProperties();
	
	if(props.IsA == "AcDbCircle")
	{
		var outStr = "\ncenter: " + props.Center;
		outStr += "\nradius: " + props.Radius;
		outStr += "\nArea: " + props.Area;
		outStr += "\nColor: " + props.Color;
		document.getElementById('testTextArea').innerHTML += outStr;
	}
						
}

function stopReactor()
{
	Acad.Application.activedocument.stopObserving(
                observedEntities1,
                Acad.Application.activedocument.eventname.modified,
                onObjectModified);
}

function execNETFunc()
{
	document.getElementById('testTextArea').innerHTML = "";
	var jsonResponse =
    exec(
      JSON.stringify({
        functionName: 'GetObjectCountData',
        invokeAsCommand: false,
        functionParams: undefined
      })
    );
	  var jsonObj = JSON.parse(jsonResponse);
	  if (jsonObj.retCode !== Acad.ErrorStatus.eJsOk) {
		throw Error(jsonObj.retErrorString);
	  }
	  
	var ret = jsonObj.retValue;
	for(var o in ret.content)
	{
		document.getElementById('testTextArea').innerHTML += ret.content[o].label + " count:" + ret.content[o].value + "\n";
	}
	
}



