var TODO_ORDERS = 'todo-orders';

$(function() 
{
	ShareThingy();
    var i = Number(localStorage.getItem('todo-counter')) + 1,
        j = 0,
        k,
        $form = $('#todo-form'),
        $removeLink = $('#show-items li a'),
        $itemList = $('#show-items'),
        $editable = $('.editable'),
        $clearAll = $('#clear-all'),
        $newTodo = $('#todo'),
        order = [],
        orderList;

    // Load todo list
    localStorage.clear();

    orderList = localStorage.getItem(TODO_ORDERS);
    
    orderList = orderList ? orderList.split(',') : [];
    
    for( j = 0, k = orderList.length; j < k; j++) 
	{
        $itemList.append
		(
            "<li id='" + orderList[j] + "'>"
            + "<span class='editable'>" 
            + localStorage.getItem(orderList[j]) 
            + "</span> <a href='#'>X</a></li>"
        );
    }
        
    // Add todo
    $form.submit(function(e) 
	{
        e.preventDefault();
        $.publish('/add/', []);

        orderList = localStorage.getItem(TODO_ORDERS);
        //var orderListText = JSON.stringify(orderList);
        console.log(orderList);
        console.log(myDocId);
        documentApi.update(myDocId,Update, {"orderList" : orderList} , ReceiveUpdate, DidNotReceiveUpdate);
    });

    // Remove todo
    $itemList.delegate('a', 'click', function(e) 
	{
        var $this = $(this);
        
        e.preventDefault();
        $.publish('/remove/', [$this]);

        var orderListText = JSON.stringify(orderList);

        documentApi.update(myDocId,Update, {"orderList" : orderListText} , ReceiveUpdate, DidNotReceiveUpdate);
    });
    
        // Sort todo
    $itemList.sortable(
	{
        revert: true,
        stop: function() 
		{
            $.publish('/regenerate-list/', []);

            var orderListText = JSON.stringify(orderList);

        	documentApi.update(myDocId,Update, {"orderList" : orderListText} , ReceiveUpdate, DidNotReceiveUpdate);
        },
    });
    
    // Edit and save todo
    $editable.inlineEdit(
	{
        save: function(e, data) {
                var $this = $(this);
                localStorage.setItem(
                    $this.parent().attr("id"), data.value
                );
            }
    });

    // Clear all
    $clearAll.click(function(e) 
	{
        e.preventDefault();
        $.publish('/clear-all/', []);

        var orderListText = JSON.stringify(orderList);

        documentApi.update(myDocId,Update, {"orderList" : orderListText} , ReceiveUpdate, DidNotReceiveUpdate);
    });

    // Fade In and Fade Out the Remove link on hover
    $itemList.delegate('li', 'mouseover mouseout', function(event) 
	{
        var $this = $(this).find('a');
        
        if(event.type === 'mouseover') 
		{
            $this.stop(true, true).fadeIn();
        } else 
		{
            $this.stop(true, true).fadeOut();
        }
    });
        
    // Subscribes
    $.subscribe('/add/', function() 
	{
        if ($newTodo.val() !== "") 
		{
            // Take the value of the input field and save it to localStorage
            localStorage.setItem( 
                "todo-" + i, $newTodo.val() 
            );
            
            console.log("Trying to add: " + $newTodo.val());

            // Set the to-do max counter so on page refresh it keeps going up instead of reset
            localStorage.setItem('todo-counter', i);
            
            // Append a new list item with the value of the new todo list
            $itemList.append(
                "<li id='todo-" + i + "'>"
                + "<span class='editable'>"
                + localStorage.getItem("todo-" + i) 
                + " </span><a href='#'>X</a></li>"
            );

            $.publish('/regenerate-list/', []);

            // Hide the new list, then fade it in for effects
            $("#todo-" + i)
                .css('display', 'none')
                .fadeIn();
            
            // Empty the input field
            $newTodo.val("");
            
            i++;
        }
    });
    
    $.subscribe('/remove/', function($this) {
        var parentId = $this.parent().attr('id');
        
        // Remove todo list from localStorage based on the id of the clicked parent element
        localStorage.removeItem(
            "'" + parentId + "'"
        );
        
        // Fade out the list item then remove from DOM
        $this.parent().fadeOut(function() { 
            $this.parent().remove();
            
            $.publish('/regenerate-list/', []);
        });
    });
    
    $.subscribe('/regenerate-list/', function() {
        var $todoItemLi = $('#show-items li');
        // Empty the order array
        order.length = 0;
        
        // Go through the list item, grab the ID then push into the array
        $todoItemLi.each(function() {
            var id = $(this).attr('id');
            var value = localStorage.getItem(id);
            order.push(value);
        });

        console.log("Pre-Renderered Orders: " + order);
        
        // Convert the array into string and save to localStorage
        var joinedOrders = order.join(',');
        console.log("Post-Renderered Orders: " + joinedOrders );
        localStorage.setItem(
            TODO_ORDERS, order.join(',')
        );
    });
    
    $.subscribe('/clear-all/', function() {
        var $todoListLi = $('#show-items li');
        
        order.length = 0;
        localStorage.clear();
        $todoListLi.remove();
    });	

}
);


function ShareThingy ()
{
	$('#share').click(function(){
		console.log("thingy is being shared");
		if( Omlet.isInstalled() )
		{
            var sendJson = {};
            sendJson["docId"] = myDocId;
            console.log(sendJson);
			var rdl = Omlet.createRDL({
					noun: "task",
					displayTitle: "Tasks",
//					displayThumbnailUrl: "http://mobi-summer-vidur.s3.amazonaws.com/casket/icon.jpg",
					displayText: "Save (and eventually share) tasks",  
					webCallback: "http://mobi-summer-vidur.s3.amazonaws.com/tasq-3/tasq.html",
					callback: window.location.href,
                    json: sendJson,
				});
            console.log(rdl);
			Omlet.exit(rdl);
		}
		else
		{
			console.log("Omlet not properly set up.");
		}
	
	});
}

Omlet.ready(function() {
    
    var omletPackage = Omlet.getPasteboard();

    if (omletPackage) 
    {
        myDocId=omletPackage.json["docId"];
        initDocument(); 
 
       // LoadGame();
    } 
    else 
    {
        initDocument();
        //setMessage("Error loading game");
    }
} );

function LoadData(){
    // Load todo list
    console.log( orderList );
    //orderList = localStorage.getItem('todo-orders');
    
    //orderList = orderList ? orderList.split(',') : [];
    
    /**/
    for( j = 0, k = orderList.length; j < k; j++) 
    {
        $('#show-items').append
        (
            "<li id='" + orderList[j] + "'>"
            + "<span class='editable'>" 
            + orderList[j]
            + "</span> <a href='#'>X</a></li>"
        );
    }
    /**/
}

//Shared Document API
function Initialize(old, params) {
    return params;
}

function Update(old, params) {
    old.orderList = params["orderList"];
    return old;
    console.log("Updating!");
}

function InitialDocument() {
    var initValues = {
        'orderList' : "",
    };
    return initValues;
}

function DocumentCreated(doc) {
    console.log("Document has been created.");
}

function ReceiveUpdate(doc) {
    myDoc = doc;
    for( key in myDoc)
    {
        console.log("Key: " + key);
    }

    console.log("orderList: " + myDoc["orderList"]);
    orderList = myDoc["orderList"];
    orderList = orderList.split(',');
    console.log("Delineated Order List: " + orderList);

    LoadData();
    console.log("I received an update!");
}

function DidNotReceiveUpdate(doc) {
    console.log("I did not receive an update");
}

//////////////////////////////
///// Framework Code   ///////
//////////////////////////////

var documentApi;
var myDoc;
var myDocId=null; 

function watchDocument(docref, OnUpdate) {
documentApi.watch(docref, function(updatedDocRef) {
if (docref != myDocId) {
console.log("Wrong document!!");
} else {
        documentApi.get(docref, OnUpdate);
        }
}, function(result) {
var timestamp = result.Expires;
    var expires = timestamp - new Date().getTime();
        var timeout = 0.8 * expires;
        setTimeout(function() {
        watchDocument(docref, OnUpdate);
        }, timeout);
}, Error);
}

function initDocument() {
if (Omlet.isInstalled()) {
            documentApi = Omlet.document;
            _loadDocument();
    }
}

function hasDocument() {
if(myDocId!==null)
{
    return true; 
}
else
{
    return false; 
}
}

function getDocumentReference() {

        return myDocId;
}

function _loadDocument() {
    if (hasDocument()) {
        myDocId = getDocumentReference();
            documentApi.get(myDocId, ReceiveUpdate);
watchDocument(myDocId, ReceiveUpdate);
} else {
            documentApi.create(function(d) {
        myDocId = d.Document;
        documentApi.update(myDocId, Initialize, InitialDocument(), 
function() {
        documentApi.get(myDocId, DocumentCreated);
}, function(e) {
      alert("error: " + JSON.stringify(e));
      });
      watchDocument(myDocId, ReceiveUpdate);
            }, function(e) {
            alert("error: " + JSON.stringify(e));
            });
    }
}