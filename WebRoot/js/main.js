/*****************************************************************************
* The main "driver script" for the analytics application.
* @author oawofolu
* 
//NOTES
//=============================================================================
// 1) In this application, base variables are used to denote two types of variables:
// a) "independent" variables which are displayed on the charts, and
// b) "filter" variables which are NOT displayed on the charts, but which are included in the filter control
// and may be used for filtering.


/***********************************************/
/** Global Variables */
/***********************************************/
// Custom class package: com.healthcit.*
var sortCount = 0;
var com = { healthcit : new Object() };
var questionId;
var baseUrlString = window.location.pathname;

// Constants
var STANDARDQUESTION_ID_LENGTH = 36;
var SIMPLETABLEANSWER_ID_LENGTH = 42;

//Configure number of answers to be shown on each iteration of results	
var globalResultsAtOnce = 4; //columns work better if this number is even
var	showMoreIsHidden = false;

// Variable which keeps track of selected rows in the table of questions
var selectedQuestionsInTable = {};

// Variable which keeps track of the order of the row indexes of the table of questions
// (array containing the current value of "sortedIndexes" in the question table's getSortInfo())
var tableSortedIndexes = null;

// Variables used as flags for checking the state of the DOM
var isReportTableReady = false;

// Variables for keeping track of reserved words
var googleQueryApiReservedWords = ['and','asc','by','date','datetime','desc','false','format','group','label','limit','not','offset','options','or','order','pivot','select','timeofday','timestamp','true','where'];

// Variables used to generate reports //
var baseVarArray = new Array();
var baseVarResultSet;
var baseVarResultSetArray = new Array();
var baseVarColumnNames = new Array();
var dependentVarArray = new Array();
var dependentVarResultSet;
var dependentVarResultSetArray = new Array();
var otherContextJoinVarResultSet;
var otherContextJoinVarResultSetArray = new Array();
var otherContextJoinVariables = new Array(); // An array of join variables associated with a join context selection of "Other"
var joinedResultSet;
var groupedResultSet;
var reportVisualizations;
var filterControl;
var aggregationSet = {};
var currentReportType = null;
// Data Types
var NUMERIC_DATA_TYPE = 1;
var STRING_DATA_TYPE = 2;
var BOOLEAN_DATA_TYPE = 3;
// Report Types
var COLUMN_CHART_ID = 1;
var AREA_CHART_ID = 2;
var PIE_CHART_ID = 3;
var LINE_CHART_ID = 4;
var TABLE_ID = 5;
var IMAGE_BAR_CHART_ID = 6;
var IMAGE_AREA_CHART_ID = 7;
var IMAGE_PIE_CHART_ID = 8;
var IMAGE_LINE_CHART_ID = 9;
//Aggregation Types
var nonNumericAggregationTypes =  [ 'count' ];
var numericAggregationTypes = ['sum', 'count', 'avg', 'min', 'max' ];
// Map of questions to data types
var questionDataTypes = new Object();
var PIPES = '||';
// Date Display Options
var dateDisplayOpts = ['full date','month and year only','month and day only','year only','day of week only','month only'];
var dateDisplayOptHovers = ['Leaves the date as is','Example: 04/1990, April 1990','Example: January 1,October 10','Example: 2003, 03','Example: Tuesday, Friday','Example: August, 08'];
var dateFormatOpts = ['month/day/4-digit year (MM/DD/YYYY)','month/day/2-digit year (MM/DD/YY)','month/4-digit year (MM/YYYY)','month/2-digit year (MM/YY)','calendar month,year (MMMM YYYY)','calendar month,day,4-digit year (MMM DD YYYY)','calendar month,day,2-digit year (MMM DD YY)'];
var dateFormatOptHovers = ['Example: 01/01/1990','Example: 01/01/09','Example: 02/2009','Example: 02/09','Example: August 2009','Example: August 10 2009','Example: August 10 09'];
// Primary Visualizations
var primaryVisualizations;
// Secondary Visualizations (NOTE: only enabled in the proprietary plugin)
var secondaryVisualizations;
// Mismatch Error Messages associated with Visualizations (NOTE: overriden in proprietary plugin code)
var visualizationMismatchErrors = null;
// An array of report types for which the current data set can NOT be displayed
var dataMismatchReportTypes = new Array();
// A JSONObject which stores a list of saved queries from the database
var savedReportQueries = null;
// Value of the current saved report id, or null if the current query is not associated with a saved report
var savedReport = null;
//Value of the last saved report id, or null if the current query is not associated with a saved report
var oldSavedReport = null;
// Flag indicating whether a saved report has been loaded
var wasSavedReportLoaded = false;
// Variable storing the current visualization configuration options
var reportConfigOptions = new Object();
// An array of "special" question fields (fields that may be included in the main table of questions that are actually autogenerated fields)
var autogeneratedQuestionFields = [ 'Module', 'Form', 'FormTableRow' ];
// Hash mapping autogenerated fields to their permissible join contexts
var autogeneratedQuestionFieldJoinContexts = {'Module' : 'module', 'Form' : 'form', 'FormTableRow' : 'table'};
// Hash mapping autogenerated fields to the join columns that they match
var autogeneratedQuestionFieldMatchingJoinColumns = {'Module' : 'ModuleId', 'Form' : 'FormId', 'FormTableRow' : 'FormTableRow'};
// An array listing the currently available join contexts from least to most restrictive
// (NOTE: Currently the user is not permitted to select the 'table' context)
var joinContextArray = ['table','default','module','form'];
//A hash mapping the fields which correspond to the currently available join contexts
var joinContextFieldMap = { 'table' : 'FormTableRow', 'default' : 'Owner', 'module' : 'ModuleId', 'form' : 'FormId'};
// List of all the join columns: "Other"-related join variable (optional), Owner, Module, Form.
var allJoinColumns = new Array();
// A hash which contains metadata information about all the modules being reported on
var appModuleMetadata = null;

// FormTable-related variables
var formTableMappings = {}; // a hash which maps questions to their source Collector tables, or none if no associated Collector table exists for the question 

// Array of answers UI elements
var answers = new Array();
/***********************************************/
/** END Global Variables */
/***********************************************/

//***********************************************/
//** Display of Sections */
//***********************************************/
// Displays welcome section
function navigateToWelcome(){
	// Display a a message overlay
	overlayScreen('Redirecting to Home Page. Please wait...');	
	simulatedSleep(1000);
	
	// Refresh the screen
	window.location.reload(true);
	// Reset the application's state
	// resetApp();
	
	// show the Welcome section
	showAnalyticsSection(['welcome_container','welcomeMessageContainer']);
	
	// get the full list of saved report queries
	generateAllReportQueries();
}

// Displays Report Generator section
function navigateToCreateReports(){
	showAnalyticsSection(['table_container','selectedQuestionAnswers']);
}

// Displays Report Generator section after clicking on a link
function linkToCreateReports(){
	// Apply "bounce" effect to the link
	jQuery('#link_create_new_reports').effect("bounce", { times:5 }, 300);
	
	// Redirect
	setTimeout(function(){navigateToCreateReports()},500);	
	
	if ( !isReportTableReady ) {
		overlayScreen('Loading questions. Please wait...');
	}
	else{
		overlayScreen('Loading questions. Please wait...');
		simulatedSleep(200);
		removeOverlayScreen();
	}
}

// Display Report Viewing section
function navigateToViewReports(){
	showAnalyticsSection(['reports_container','selectedQuestionAnswers']);
}

function showAnalyticsSection(sections){
	// show an overlay message while the Home Page loads
	overlayCurrentPage(sections);
	
	// insert delay
	simulatedSleep(300);
	
	// show the "Loading" image while the reporting graphic is still loading
	showSpinner('reports_container_spinner');
	// clear the contents of the reports section
	jQuery('div[id^=reports_div_]').empty();
	// clear the contents of the filter controls section and hide the filter control
	jQuery("#filter_container").empty();
	jQuery("#filter_container_wrapper").hide();
	// clear the contents of the reports-controls section
	jQuery("#report_controls").empty();
	jQuery("#report_controls").removeClass('report_controls');
	// update the menu bars as appropriate
	updateMenus( sections );
	// update the submenu bars as appropriate
	// updateSubMenus( sections );
	// show the appropriate section and hide the others as appropriate
	doShowHide( sections );
	// set up the table of questions as appropriate
	var includePaginator = ( arrayContains(sections,'table_container') && isReportTableReady );
	finalizeQuestionTableSetUp(sections);
	// generate the analytical reports if the Reports section was selected
	if ( arrayContains(sections,'reports_container') ) generateAnalytics();
}

// Shows/hides rows in the table of questions as appropriate;
// includes client-side pagination functionality;
// displays the "Answers" column as appropriate
function finalizeQuestionTableSetUp(sections) {

	// Make sure to only display the rows associated with the selected questions if the current page is the "View Reports" screen
	if ( isViewReportsPage() ) {
		var checkedQIdTableRows = jQuery('input[type=checkbox][id^=check_]:checked').parentsUntil('tr').parent();
		setReportTableRowElementVar( checkedQIdTableRows );
	}
	
	// set up pagination if appropriate
	if ( arrayContains(sections,'table_container') && isReportTableReady ) {
		resetTablePaginator();
	}
	
	else {
		removePaginator();
	}
	
	// display the "Answers" column if appropriate
	if ( arrayContains(sections,'table_container') && isReportTableReady ) {
		showHideAnswersColumn();
	}
	
}


// Displays the first page of question table rows, including pagination
function displayReportTableFirstPage(){
	resetTablePaginator();
}

function overlayCurrentPage(sections){
	var waitMsg;
	var viewReportsWaitMsg = 'Generating report...';
	var createReportsWaitMsg = 'Setting up query template...';
	
	if ( arrayContains(sections,'reports_container') ) {
		waitMsg = viewReportsWaitMsg;
	}
	else if ( arrayContains(sections,'table_container') && wasSavedReportLoaded ) {
		waitMsg = createReportsWaitMsg;
	}
	
	if ( waitMsg ) {
		simulatedSleep(300);
		overlayScreen(waitMsg);
	}
}

function doShowHide( sections ) {
	
	if ( sections && sections.length != 0 ){
		var visibleSelectorStr = '';
		var hiddenSelectorStr = '';
		
		for ( var i = 0 ; i < sections.length; ++i ) {
			visibleSelectorStr += '[id!=' + sections[i] + ']';
		}
		jQuery('.container' + visibleSelectorStr + ':visible').toggle(1000);
		jQuery('.container' + visibleSelectorStr).slideUp();
			
		for ( var i = 0 ; i < sections.length; ++i ) {
			jQuery('.container[id=' + sections[i] + ']:hidden').toggle(1000);
		}
	}
}
//***********************************************/
// END Display of Sections */
//***********************************************/

//***********************************************/
/* Utility Methods for Menu Bars */
//***********************************************/
function updateMenus( sections ) {
	// find the value of the element Id to be highlighted as the current tab
	var menuId = findCurrentMenuTab( sections );
	
	// if the element Id was found then set it up as the current menu item
	if ( menuId ) setAsCurrentMenuTab( menuId, 'menu_container' );
}

/* Utility Methods for SubMenu Bars */
function updateSubMenus( sections ){
	// Hash which maps each primary menu tab to a list of submenu options
	/*var subMenuHash = { 'table_container' : [ {'list_questions_tab':'List Questions'},
	                                              {'list_table_questions_tab':'List Tables'} ]};*/
	var listSearchTabHtml = '<span id="searchFormStatusFld"></span><span class="searchIconImg" onclick="showSearchBoxes(\'table_container_content\',\'table_container\');">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="searchLabel">&nbsp;Search&hellip;</span>';
	var subMenuHash = { 'table_container' : [ {'list_search_tab': listSearchTabHtml } ]};
		
	// find the currently selected menu item
	var menuId = findCurrentMenuTab( sections );	
	var hasSubMenu = menuId ? subMenuHash[menuId] : false;
	if ( hasSubMenu ) {
		// set up the submenu list
		var subMenuList = subMenuHash[menuId]; 
		var subMenuHtml = '';
		var subMenuId = '';
		subMenuHtml += '<div class="tabs">';
		for ( var i = 0 ; i < subMenuList.length; ++i ) {
			for ( var elmId in subMenuList[i] ){
				subMenuHtml += '<span id="'+elmId+'"';
				subMenuHtml += (i==0 ? ' class="current" ' : '');
				subMenuHtml += '>' + subMenuList[i][elmId] +'</span>';
				if ( i==0 ) subMenuId = elmId;
			}
		}	
		subMenuHtml += '</div>';
		jQuery('#submenu_container').html(subMenuHtml);
		
		// set the current submenu selection
		setAsCurrentMenuTab( subMenuId, 'submenu_container' );
	} else{
		jQuery('#submenu_container').html('');
	}
}

/*Utility Method to find the currently selected menu item*/
function findCurrentMenuTab( sections ) {
	for ( var i = 0; i < sections.length; ++i ) {
		if (jQuery('#' + sections[i] + '_tab')) {
			return sections[i];
		} 
	}
}

// Method which sets up the currently selected menu tab
function setAsCurrentMenuTab(divId,menuStyleClass) {
	jQuery('#' + divId + '_tab').siblings().removeClass('current');
	jQuery('.'+menuStyleClass+' a[id=' + divId + '_tab]').addClass('current');
	// if the current tab is in the Reports section, then update the Reports header caption appropriately
	var isInReportsSection = (divId.indexOf('reportType')>-1);
	if ( isInReportsSection ) {
		var currentMenuTabTitle = jQuery('#'+divId + '_tab').html();
		if ( currentMenuTabTitle ){
			currentMenuTabTitle = currentMenuTabTitle.toUpperCase();
			jQuery(".reportsHeaderBanner span.currentTabTitle").remove();
			jQuery(".reportsHeaderBanner").prepend("<span class=\"currentTabTitle\">" + currentMenuTabTitle + "</span>");
		}
	}
}
//***********************************************/
//END Utility Methods for Menu Bars
//***********************************************/

/***********************************************/
/** Populate Questions */
/***********************************************/
function preHandleCallback() {
  // show the "Loading" image while the reporting graphic is still loading
  showSpinner('table_container_spinner');
  
  // prepare all objects that will be required before running the query that generates questions
  var query = new google.visualization.Query(baseUrlString + 'caHopeDS?viewName=GetQuestionDataType&group=true&orderedColumnNames=QId,TableType,DType,QTotal&numericDataType=QTotal');
  query.setQuery('select QId,TableType,DType,QTotal');					  
  query.send(preHandleCallbackResponse);					  
}  		

function preHandleCallbackResponse(response) {
	if (response.isError()) {
	  jAlert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
	  return;
    }

	var data  = response.getDataTable();
	
	// Populate hash which keeps track of the number of data types available for each question
	for ( var num = 0; num < data.getNumberOfRows(); ++num ){
		var qId = data.getValue(num,0);
		var tableType = data.getValue(num,1);
		var datatype = data.getValue(num,2);
		var total = data.getValue(num,3);
		questionDataTypes[qId + PIPES + datatype + (tableType && tableType!='null' ? tableType : '')] = total;
	}
	
	// Get Form Table metadata
	var formTableQuery = new google.visualization.Query(baseUrlString + 'caHopeDS?viewName=GetAllQuestionsWithAssociatedTables&group=true&orderedColumnNames=Id,FormTableType,FormTableId,FormTableShortName,IdentifyingCol');
	formTableQuery.setQuery('select Id,FormTableType,FormTableId,FormTableShortName,IdentifyingCol');
	formTableQuery.send(handleFormTableQueryResponse);
  
	// Get List of Questions
    var query = new google.visualization.Query(baseUrlString + 'caHopeDS?viewName=GetAllQuestions&group=true&orderedColumnNames=Id,ShortName,Text,SearchMetaData,TableMetaData');
	query.setQuery('select Id, ShortName, Text, SearchMetaData, TableMetaData');					  
    query.send(handleQueryResponse);	
    
    // Perform any other "onload"-related functions
    executeOnload();
} 
			  
function handleQueryResponse(response) {
    if (response.isError()) {
	  jAlert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
	  return;
    }

    var data  = response.getDataTable();	
    
    var formatter1 = new google.visualization.PatternFormat(
    	"<a name=\"anchor_{0}\"></a>" +
    	"<input class=\"shortNameToggle\" type=\"checkbox\" id=\"check_{0}\"" + 
    	"onclick=\"addAnswersBlock('{0}')\" value=\"{1}\"/>&nbsp;" +
    	"{1}<span id=\"spinner_{0}\" class=\"spinner\" style=\"display:none;\">&nbsp;&nbsp;</span><br/><div id=\"div_{0}\"></div>");
    
    formatter1.format( data, [0,1], 1 );
    
    var formatter2 = new google.visualization.PatternFormat(
        	"{0}<br/><br/><span class=\"tablemetadataspan\">{1}</span>" +
        	"<span class=\"searchmetadataspan\">{2}</span>");
        
    formatter2.format( data, [2,4,3], 2 );
    
    var view = new google.visualization.DataView(data);
	
	view.setColumns([1,2,{calc:generateRightColumn, type:'string', id:'test'} ]);
	
	//needed to set class on right column so it can be hidden until needed
	function generateRightColumn(dataTable, rowNum){
		return "<div id=\"right_"+dataTable.getValue(rowNum, 0)+"\"></div>";
	}
	
	var reportTable = new google.visualization.Table($("table_container_content"));
	
	//~~~~~~~~~~~~~Implement Event Listeners~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//custom sort event to disable sorting on 3rd column and update the contents of the table
	google.visualization.events.addListener(reportTable, 'sort',function(event) {
			var upDownArrow = "&#9650;";
			
			//global variable incremented to determine if sorting ascending or descending
			sortCount ++;
			var ascDesc = (sortCount % 2 ==0)
			if(ascDesc) upDownArrow = "&#9660;";
			
			// clear search results if applicable
			if ( isCreateReportsPage() && isInSearchMode() ) {
				clearTableSearch();	
			}
			
			// Sort the table
			updateHtmlForQuestionsTableSort(reportTable,data,view,event,ascDesc,upDownArrow);
	});
	// event which will signal when the table is fully loaded
	google.visualization.events.addListener(reportTable, 'ready', function(event){
		isReportTableReady = true;
		
		// Remove overlay screen when appropriate
		var maskMsgs = ['Loading questions. Please wait...'];
		if ( arrayContains( maskMsgs, getOverlayMessage() )) {
			removeOverlayScreen();
		}
		
		// Add the table paginator when appropriate
		if ( isCreateReportsPage() ) {
			displayReportTableFirstPage();
		}
		
		// Execute the most recently clicked query, if any
		performActionOnSelectedSavedReport();
	});
	//~~~~~~~~~~~~~END Implement Event Listeners~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	
	//~~~~~~~~~~~~~Draw the table~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// TODO: Sorting has been disabled for now - figure out a way to correctly handle sorting with pagination.
	reportTable.draw(view,{sort:"disable",allowHtml:true,showRowNumber:false,cssClassNames:{hoverTableRow:'noBackground',selectedTableRow:'noBackground',headerRow:'reportsTableHeader', headerCell:'reportsTableHeaderCell'}});
	//jQuery(".google-visualization-table-table .reportsTableHeader td:last").hide();
	jQuery(".google-visualization-table-table td:nth-child(3n)").removeClass('answersShow').addClass('answersHide');
	// hide the spinner
	hideSpinner('table_container_spinner');
	
}


/**
 * This function handles any functionalities 
 * not related to Google queries that should be executed when the page loads.
 */
function executeOnload(){
	// Set up the variable which will store module metadata information
	moduleMetadataService.loadModuleMetaData({
			callback: function( data ){ 
				if ( data ) appModuleMetadata = eval('(' + data + ')'); 
			},
			errorHandler: function( msg, exception ){ 
				jAlert('Sorry, an error occurred while loading metadata - please contact your System Administrator.'); 
			}
	});
	
	//..............execute other "onload" functions...................
}

/**
 * This function updates the content of the table when it is sorted
 * 
 * 
 * NOTE: Bug fix: Currently, the default Google sort causes the original content of selected/modified rows to be lost.
 * To fix this, we store the original contents of the rows that have been selected so that they can be updated later.
 */
function updateHtmlForQuestionsTableSort(reportTable,data,view,event,ascDesc,upDownArrow) {
	// Get all rows which have questions selected
	var elms = jQuery('input[id^=check_]:checked').parentsUntil('tr').parent();	
	
	// For each question, determine the HTML content of the row in the unsorted version of the table
	// by looking up its row index in the current version of the table
	// and using it to map to its html content
	elms.each( function(){ 
		var elm = jQuery(this);
		var sortedIndex = jQuery('table.google-visualization-table-table tr').index(elm)-1;
		var unsortedIndex = tableSortedIndexes ? tableSortedIndexes[ sortedIndex ] : sortedIndex;
		var htmlString = elm.htmlWithFormElementValues();
		selectedQuestionsInTable[unsortedIndex+''] = htmlString;
	});
		
	// reset the order of the rows in the table
	tableSortedIndexes = data.getSortedRows([{column: view.getTableColumnIndex(event.column), desc: ascDesc}]);
	view.setRows(tableSortedIndexes);
	reportTable.draw(view,{
		sort:"event",allowHtml:true,showRowNumber:false,cssClassNames:{hoverTableRow:'noBackground',selectedTableRow:'noBackground',headerRow:'reportsTableHeader', headerCell:'reportsTableHeaderCell'}
	});
		
	
	// Now, update the content of the rows that have selected questions
	// by mapping their current indexes to the "unsorted" index equivalent
	// and getting the HTML associated with the "unsorted" index (stored in the "selectedQuestionsInTable" object)
	for ( var unsortedIndex in selectedQuestionsInTable ) {
		var htmlString = selectedQuestionsInTable[unsortedIndex];
		var sortedIndex = jQuery.inArray(parseInt(unsortedIndex),tableSortedIndexes) + 2; // Add 2; 1 to exclude the header row, +1 because the nth-child JQuery selector is 1-based
		var sortedIndexRow = jQuery('table.google-visualization-table-table tr:nth-child(' + sortedIndex + ')');
		sortedIndexRow.html(htmlString);
	}
	
	// Make any final updates to restore anything that the table visualization may have lost during the sort:
	
	// Show or hide the "Answers" column header as appropriate
	showHideAnswersColumnHeader();
	
	// Add the up/down arrow
	jQuery(".google-visualization-table-table .reportsTableHeader td:eq("+event.column+") span").html(upDownArrow);
	
	// Update the table's styling
	jQuery(".reportsTableHeader td:last").html("Answers");//.show();
	jQuery("#table_container_content .google-visualization-table-table td:nth-child(3n)").addClass('answersShow').removeClass('answersHide');
	//jQuery(".google-visualization-table-table tr .google-visualization-table-td-number").css("display", "table-cell");
	
}
// end POPULATE QUESTIONS
/***********************************************/
/** Select a Question
/***********************************************/
function selectQuestion(qId){
	// set the "checked" attribute
	jQuery('#check_'+qId).attr('checked',true);
	
	// add the associated Answers block
	addAnswersBlock(qId);
}

/***********************************************/
/** Deselect a Question
/***********************************************/
function deselectQuestion(qId){
	// set the "checked" attribute
	jQuery('#check_'+qId).attr('checked',false);
	
	// add the associated Answers block
	addAnswersBlock(qId);
}

/***********************************************/
/** Populate Answers
/***********************************************/
function addAnswersBlock(qId){  
  // (Enhancement) In some cases, there could be multiple question checkboxes with the same question ID;
  // before proceeding, handle duplicates as appropriate
  if ( hasDuplicateQuestion( qId ) ) {
	  var duplicatesResolved = resolveDuplicateQuestions( qId );
	  // If the duplicates could not be resolved, 
	  // then it means that user action is required to proceed,
	  // so exit
	  if ( !duplicatesResolved ) return;
  }
  // whether or not this question was selected
  var isQIdSelected = ( jQuery('#check_'+qId).is(':checked') );
  if ( isQIdSelected ){ // the question checkbox was selected
	  if ( canMakeQuestionSelection(qId) ) {
		  // show the spinner
		  showSpinner( 'spinner_' + qId );	  
		  	  
		  // show the Independent/Dependent/Filter dropdown
		  showOrHideById('selectdiv_'+qId,1);
		  
		  //show 3rd column and filters
		  jQuery(".reportsTableHeader td:last").html("Answers").show();
		  jQuery("#right_"+qId).parent().show();
		  jQuery("#right_"+qId).show();
		  	  
		  // hide or show all answer checkboxes for this question
		  // based on the value of the independent/dependent/filter dropdown
		  showOrHideAnswerCheckboxes(qId);
		  
		  // handle More/Less Answers' links appropriately
		  handleMoreAndLessAnswerLinks(qId,'show');
		
		  // If the answers have already been displayed for this question but they are merely hidden,
		  // then show the answers;
	      // else build a CouchDB query for the answers to this question
		  if ( jQuery('#answers_'+ qId).val() == undefined ){
			  executeQueryForAnswers(0, qId);
		  }
		  else {
			  displayAnswersForQuestion( qId );
		  }
		  
		  //style third column
		  jQuery("#table_container_content .google-visualization-table-table td:nth-child(3n)").addClass('answersShow').removeClass('answersHide');
		  //jQuery(".google-visualization-table-table tr .google-visualization-table-td-number").css("display", "table-cell");
	  }
  }
  else{ // the question checkbox was deselected
	// handle More/Less Answers' links appropriately
	handleMoreAndLessAnswerLinks(qId,'hide');

	// hide the Independent/Dependent/Filter dropdown
	showOrHideById('selectdiv_'+qId,2);
		
	//hide 3rd column if all hidden
	if(jQuery(".shortNameToggle:checked").length==0){
		//jQuery(".google-visualization-table-table tr .google-visualization-table-td-number").css("display", "none");
		jQuery("#table_container_content .google-visualization-table-table td:nth-child(3n)").removeClass('answersShow').addClass('answersHide');
		jQuery(".reportsTableHeader td:last").html("Answers").slideUp();
	}
	// uncheck all answer checkboxes
	jQuery('#answers_'+qId+' div input[type=checkbox]:checked').attr('checked',false);
	
	// hide the set of answers
	showOrHideById('answers_'+qId, 2, 1400);
	  
	// update the answers confirmation box    
	updateConfirmationBox(qId,'check_'+qId);
	  
	// Reset the IDs of duplicate questions, as appropriate
	removeTemporarySuffixesFromDuplicateQuestions( qId );
  }  
  

  // (Bug fix) Ensure that the focus stays around the clicked checkbox;
  // the screen should not scroll to the top of the page unnecessarily.
  var isLastQuestionSelected = jQuery('input[id^=check_]:checked').length == ( isQIdSelected ? 1 : 0 );
  if ( isLastQuestionSelected && !wasSavedReportLoaded ) resetScrollPosition('anchor_'+qId);
}

// Function which shows or hides the Answers column depending on
// whether any questions are selected
function showHideAnswersColumnHeader(){
	if(jQuery(".shortNameToggle:checked").length==0){
		jQuery(".reportsTableHeader td:last").html("Answers").slideUp();
	}
	else {
		jQuery(".reportsTableHeader td:last").html("Answers").show();
	}
}

// Function which shows or hides the Answers column
// depending on whether any questions are selected
function showHideAnswersColumn(){
	if(jQuery(".shortNameToggle:checked").length==0){
		jQuery(".reportsTableHeader td:last").html("Answers").slideUp();
		jQuery("#table_container_content .google-visualization-table-table td:nth-child(3n)").addClass('answersHide').removeClass('answersShow');
	}
	else {
		jQuery(".reportsTableHeader td:last").html("Answers").show();
		jQuery("#table_container_content .google-visualization-table-table td:nth-child(3n)").addClass('answersShow').removeClass('answersHide');
	}
}

function resetScrollPosition(anchor){
	// If no questions are selected, then set the scrollbar to move to the top of the table of questions
	var noQuestionsSelected = jQuery('input[id^=check]:checked').length == 0;
	if ( noQuestionsSelected ) jQuery('#table_container').animate({scrollTop:0},200);
	
	// Otherwise, set the "hash" property of the location so that the page scrolls to the given anchor
	else goToQuestionAnchor(anchor);
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//This function resolves the issue of selecting a question
// with duplicates
// by preventing the user from being able to select more than one 
// of the duplicate questions at a time.
// Also, currently the DOM IDs of the duplicate questions are the same, 
// which poses a problem since the questions are processed by ID.
// This is resolved by temporarily resetting the IDs of the non-selected
// duplicates once one is selected,
// and setting them back to their original IDs once it is deselected.
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function resolveDuplicateQuestions(qId){
	// The prefix of the question checkboxes
	var prefix = 'check_';
	
	// The ID of the original question checkbox
	var qIdOriginalCheckboxId = prefix + qId;
	
	// The value of the original checkbox question
	var qIdOriginalCheckboxValue = jQuery('[id=' + qIdOriginalCheckboxId + ']:checked').val();
	
	// Whether it was checked
	var wasOriginalChecked = !!qIdOriginalCheckboxValue;
		
	// If there are duplicate question elements with the same ID and value, then
	// remove those duplicate elements
	jQuery('[id=' + qIdOriginalCheckboxId + '][value=' + qIdOriginalCheckboxValue + ']').not(':first').parentsUntil('tr').parent().remove();
	jQuery('[id=' + qIdOriginalCheckboxId + '][value=' + qIdOriginalCheckboxValue + ']:first').attr('checked',wasOriginalChecked);
		
	// Otherwise, any duplicates will be question elements with the same ID but different values.
	// Get the number of duplicates that were selected
	var numSelected = jQuery('[id^=' + qIdOriginalCheckboxId + ']:checked').length;
	
	// Get the ID of the last selected question:
	// Since we assume that only one duplicate will be selected at a time,
	// we can assume that:
	// - if more than 1 is selected then the ID will have a suffix,
	// - if only 1 is selected then it won't have a suffix,
	// - if none are selected then the ID will be null.
	var qIdCheckboxId;
	if ( numSelected > 1 ) qIdCheckboxId = jQuery('[id^=' + qIdOriginalCheckboxId + '][id!=' + qIdOriginalCheckboxId + ']').attr('id');
	else if ( numSelected == 1) qIdCheckboxId = qIdOriginalCheckboxId;
	else qIdCheckboxId = 'DUMMYID';	
		
	// Get the value of the selected question
	var qIdValue = jQuery('[id=' + qIdCheckboxId + ']:checked').val();
	
	// Determine whether or not this question was checked
	var wasQuestionChecked = !!qIdValue;	

	// Get the list of duplicate questions whose IDs need to be reset
	var duplicatesToReset;
	
	if ( wasQuestionChecked ){ // means this question was checked
		duplicatesToReset = jQuery('[id^=' + qIdOriginalCheckboxId + '][value!=' + qIdValue + ']');
		if ( duplicatesToReset.filter(':checked').length > 0 ) {
			// If there is another duplicate question that was previously checked,
			// then alert the user that all duplicate questions should be removed from the query first.
			var alertMsg = 'You have previously selected a duplicate of this question with a different shortname: ';
			alertMsg +=  '<br/><br/><b>' + duplicatesToReset.filter(':checked').val() + '</b><br/>';
			alertMsg += '<br/>To select this question, you must deselect the duplicate(s) first.';
			jAlert(alertMsg,'CANNOT SELECT DUPLICATE QUESTION');
			
			// deselect this question
			jQuery('[id=' + qIdCheckboxId + ']:checked').attr('checked',false);
			
			// return false
			return false;
		}
		else { // means that this is the only duplicate question that was checked
			// reset the IDs of the duplicates as follows:
			// if the question was checked then reset all non-checked duplicates by adding a suffix to the IDs
			addTemporarySuffixesToDuplicateQuestions( qId, duplicatesToReset );
		}
	} 		
	// return true
	return true;
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Function which determines whether or not this question 
// is associated with a set of duplicate questions
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function hasDuplicateQuestion( qId ) {
	return jQuery('[id^=check_' + qId + ']').length > 1 ;
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Function for temporarily resetting the IDs 
// of a set of duplicate question elements
// by adding a suffix to them
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function addTemporarySuffixesToDuplicateQuestions( qId, duplicates ) {
	duplicates.each(function(ctr){
		jQuery('[id=' + this.id + '][value=' + this.value + ']').parentsUntil('tr').parent().find('*').each(function(){
		     var current_id = this.id;
		     if ( current_id && current_id.indexOf('_'+qId) > -1 ){
		    	 this.id += '_' + ctr;
		     }
	})});
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Function for removing 
// temporarily added suffixes 
// from a set of duplicate questions
// (Meant to be called whenever a duplicate question is deselected)
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function removeTemporarySuffixesFromDuplicateQuestions( qId ) {
	var duplicates = jQuery('[id^=check_' + qId + ']');
	if ( duplicates.filter(':checked').length == 0 ) {
		duplicates.parentsUntil('tr').parent().find('*').each(function(){
		     var current_id = this.id;
		     if ( current_id && current_id.indexOf('_'+qId) > -1 ){
		    	 jQuery('[id='+this.id+']').closest('div[id^=right_]').hide(); // ensure that the "Answers" section is hidden, since it is always hidden when its associated question is deselected
		    	 this.id = current_id.replace( /_[0-9]+$/, '' );
		     }
		});
	}
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Functions for showing more/less answers per question
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function handleMoreAndLessAnswerLinks( qId, showOrHideFlag ){
	if ( showOrHideFlag == 'show' ) {		  
		if(jQuery("#more_"+qId).hasClass("wasVisible")){
			showOrHideById("more_"+qId, 1);
		}
		if(jQuery("#less_"+qId).hasClass("wasVisible")){
			showOrHideById("less_"+qId, 1);
		}
		jQuery("#more_"+qId).removeClass("wasVisible");
		jQuery("#less_"+qId).removeClass("wasVisible");

	}
	else { // showOrHideFlag = 'hide'
		jQuery("#more_"+qId).removeClass("wasVisible");
		jQuery("#less_"+qId).removeClass("wasVisible");
		if(jQuery("#more_"+qId).is(":visible")){
			jQuery("#more_"+qId).addClass("wasVisible");
		}
		if(jQuery("#less_"+qId).is(":visible")){
			jQuery("#less_"+qId).addClass("wasVisible");
		}

		//hide more and less answers link
		showOrHideById("more_"+qId, 0);
		showOrHideById("less_"+qId, 0);
	}
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//END Functions for showing more/less answers per question
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
				  
function populateAnswersForQuestion(response) {	
	var spinnerId = 'spinner_' + questionId;
	
    if (response.isError()) {
	  jAlert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
      hideSpinner( spinnerId );
	  return;
    }

    // Get the DataTable associated with the response
    var data  = response.getDataTable();
        
    // Display the answers
    displayAnswersForQuestion( questionId, data );
}

function displayAnswersForQuestion( qId, data ) {
    var answerDiv = 'div_' + qId;
    var answerSetDivId = 'answers_'+ qId;
    var currElmId = 'check_' + qId;
    var spinnerId = 'spinner_' + qId;
	var moreId = 'more_' + qId;
	var rightDiv = 'right_'+qId;

	if ( !data )
	{
		showOrHideById(answerSetDivId,1,1400);
	}
	
	else
	{
		var answersArray = new Array();
		
    	// Apply custom formatting to the Answers column as appropriate
		formatColumn( data, 3, getQuestionShortName( qId ) );
	    
	    for ( var i = 0 ; i < data.getNumberOfRows(); ++i ) {
	    	
	    	var value = data.getFormattedValue( i, 3 ) || data.getValue( i, 3 );
	    	
	    	if ( answersArray.indexOf( value ) == -1 ) {
	    		answersArray.push( value );
	    	}
	    }
	
		//if all answers are displayed, hide more answers link
		if(answersArray.length<globalResultsAtOnce){
			showOrHideById(moreId, 0); 
			showMoreIsHidden = true; //no other way to later determine if all answers have already been displayed
		}
		
		if ( jQuery('#'+currElmId).is(':checked')) {//question checkbox is checked
			var questionAnswers = this.answers[questionId];
			var answersDivIsEmpty = jQuery('#'+answerDiv).is(':empty');
			if ( /*jQuery('#'+ answerSetDivId).val()===undefined*/questionAnswers == undefined || answersDivIsEmpty ) { // means the answers block has not been previously added
				var currSelection = jQuery('#'+currElmId).val();
				var htmlString = "<div class=\"questionTypeSelect\" id=\"selectdiv_" + questionId + "\"><div class=\"questionTypeSelectChild1\"><span>Variable Type:<br/></span><select id=\"select_" + questionId + "\" name=\"select_" + questionId + "\" onchange=\"updateConfirmationBox('" + questionId+"','" + currElmId +"')\"><option value=\"independent\">Independent</option><option value=\"dependent\">Dependent</option><option value=\"filter\">Filter</option></select></div>";  
				htmlString += "<div class=\"questionTypeSelectChild2\"><span>Data Type:<br/></span><select id=\"seldata_" + questionId + "\" name=\"seldata_" + questionId + "\"  onchange=\"updateDataType('" + questionId+"')\"><option value=\"string\">String</option><option value=\"number\">Numeric</option><option value=\"date\">Date</option></select></div>";
				// Add FormTable-related section, if appropriate
				htmlString += getFormTableHTMLSection( questionId );
				htmlString += "<fieldset class=\"questionTypeDisplay\"><legend>Group By</legend>";
				htmlString += "<select id=\"seljoin_" + questionId + "\" name=\"seljoin_" + questionId + "\" onchange=\"updateJoinContext('" + questionId +"')\" ><option value=\"default\">Default</option><option value=\"module\">Module</option><option value=\"form\">Form</option><option value=\"other\">Other</option></select>";
				htmlString += "<div class=\"otherJoinTxt\" id=\"otherJoinTxt_" + questionId + "\" style=\"display:none;\"><label>Other: </label><span id=\"seljoinothertxt_" + questionId + "\" title=\"Click to edit...\" onclick=\"displayJoinContextForm('" + questionId+"');\"></span>";
				htmlString += "<input id=\"seljoinother_" + questionId + "\" name=\"seljoinother_" + questionId + "\" type=\"text\" value=\"\" style=\"display:none;\" onchange=\"refreshJoinContextOtherSection('" + questionId + "')\"/></div>";
				htmlString += "</fieldset>";
				//htmlString += "</div>";
				var rightColumnHtml = '<div class="rightColumnWrap">';
				//rightColumnHtml += '<div id="' + plusMinusDivId + '"class="minusicon" onclick="plusMinusClick(this,\'' + answerSetDivId +'\',\''+questionId+ '\')">Hide</div>';
				rightColumnHtml+='</div>';
				jQuery('#'+answerDiv).append(htmlString);
				
				//---------Add answer-----------
				var el = jQuery(rightColumnHtml);
				questionAnswers = new com.healthcit.hopeanalytics.Answer(el, answersArray, questionId, globalResultsAtOnce);
				questionAnswers.setConfirmationBoxCallback(updateConfirmationBox);
				questionAnswers.setLayoutCallback(updateAnswerSectionLayout);
				answers[questionId] = questionAnswers;
				if(answersArray.length>=globalResultsAtOnce){//if more than specified number of answers, add link to show more
					el.append('<a href="#more" id="'+moreId+'" class="showMore">+ Show More</a>');
				}
				jQuery('#'+rightDiv).append(el);
				
				//------------------------------
				
				//jQuery('#'+rightDiv).append(rightColumnHtml);
			}
			else if (jQuery('#'+ answerSetDivId).is(':hidden')) { // means the answers block was previous added,but it is just hidden
				showOrHideById(answerSetDivId,1,1400);
				
			}
			else{ //if not hidden, must be adding more answers
				questionAnswers.addAnswers(answersArray);
			}
		}
	}
	//hide the spinner
	hideSpinner( spinnerId );
	    
    // update the answers confirmation box    
    var ansCheckId = currElmId;
	updateConfirmationBox(qId,ansCheckId);

	//faux columns	
	updateAnswerSectionLayout(qId);	
}

function updateAnswerSectionLayout(qId){
	if(jQuery(".leftColumn").length==0){
		var totalAnswers = jQuery("#answers_"+ qId + " div").length;
		if(totalAnswers>globalResultsAtOnce){
			for(var i=0;i<totalAnswers;i=i+2){
				jQuery("#answers_"+ qId + " div:eq("+i+")").addClass("leftColumn");
			}
			for(var i=1;i<totalAnswers;i=i+2){
				jQuery("#answers_"+ qId + " div:eq("+i+")").addClass("rightColumn");
			}
		}
	}
	else{
		var totalAnswers = jQuery("#answers_"+ qId + " div").length;
		if(totalAnswers>globalResultsAtOnce){
			var startIndex = jQuery("#answers_"+ qId + " div.leftColumn:last").index()+1;
			for(var i=startIndex;i<totalAnswers;i=i+2){
				jQuery("#answers_"+ qId + " div:eq("+i+")").addClass("leftColumn");
			}
			for(var i=startIndex+1;i<totalAnswers;i=i+2){
				jQuery("#answers_"+ qId + " div:eq("+i+")").addClass("rightColumn");
			}
			jQuery("#answers_"+ questionId + " div").each(function(index){
				if(!jQuery(this).hasClass("rightColumn") && !jQuery(this).hasClass("leftColumn")){
						jQuery(this).addClass("rightColumn");
				}
			});
		} else {
			jQuery(".leftColumn").removeClass("leftColumn");
			jQuery(".rightColumn").removeClass("rightColumn");
		}
	}
}

function setAnswersConfirmationBox(answerIndex,qId){
	var ansCheckId = 'ans_' + answerIndex + '_' + qId;
	updateConfirmationBox(qId,ansCheckId);
}

function showOrHideAnswerCheckboxes(qId){
	var indDepSelectDropdownId = 'select_' + qId;
	var answerSetDivId = 'answers_' + qId;
	var value = jQuery('#'+indDepSelectDropdownId).val();
	if ( value=="independent" || value=="filter" ) {// then hide all answer checkboxes
		jQuery('#'+answerSetDivId+' div input[type=checkbox]').hide();
	}
	else{ //show all answer checkboxes
		jQuery('#'+answerSetDivId+' div input[type=checkbox]').show();
	}
}

function executeQueryForAnswers(skipValue, qId){
	var queryString = baseUrlString + 'caHopeDS?viewName=GetAllQuestionsWithAnswers&group=true&orderedColumnNames=QId,QText,AId,AText';
	queryString += '&startkey=["' + qId + '"]&endkey=["' + qId + ',{}"]';
	queryString += '&limit='+globalResultsAtOnce+'&skip='+skipValue;
	
	var query = new google.visualization.Query(queryString);		
	query.setQuery('select QId, QText, AId, AText');	
	questionId = qId; //set global variable to be used in the callback function
	//globalQueryString = limitedQueryString; //set global variable to be used in the callback function
	query.send(populateAnswersForQuestion);	
}

/*"Show more answers" link event*/
jQuery("a.showMore").live('click', function() {
	var answerId = jQuery(this).attr('id');
	//get number of answers already loaded
	var skipValue = jQuery(this).siblings("fieldset").children("div").length;
	
	questionId = answerId.substring(5);
	
	executeQueryForAnswers(skipValue, questionId);
	
	//add show less link if it hasn't been added
	if(jQuery("#less_"+questionId).length==0 || jQuery("#less_"+questionId+":hidden").length>0){
		jQuery(this).after('<a href="#showLess" class="showLessLink" id="less_'+questionId+'">- Show Less</a>').hide().slideDown();
	}
	
	return false;
});

/*"Show less answers" link event*/
jQuery("a.showLessLink").live('click', function() {
	var answerId = jQuery(this).attr('id');
	
	questionId = answerId.substring(5);
	var ans = answers[questionId];
	var hasMore = ans.removeAnswers();
	showOrHideById("more_"+questionId, 1);
	if(hasMore){	
		jQuery(this).hide();			
	}
	
	return false;
});

// end POPULATE ANSWERS

/***********************************************/
/** Functions setting up JOIN CONTEXTS */
/** EXPLANATION OF JOIN CONTEXT:
 *  1) The "join context" refers to a set of fields (Module/Form/FormTableRow/specific Question)
 *   that will be used in a query to join 2 Question fields.
 *  
 *  2) The "join contexts" that may be defined by a user are:
 *     - "Default" (Owner)
 *     - "Module"
 *     - "Form"
 *     - "Other" (specific Question field selected by the user)
 *  
 *  3) The "join context" applies to 2 Question fields. 
 *  Even though the user defines a "join context" for each question individually, 
 *  the "join context" actually only applies to the question field in the context of another question field. 
 *  The actual join context between 2 Question fields is determined as the join context of one of the fields.
 *  Usually, it will be the join context of the second field, 
 *  EXCEPT when the first field is an Independent variable, in which case it becomes the join context of the first field.
 *  
 *    
 *  4) "Join Context/Variable" and "Group By Context/Variable" are used interchangeably because 
 *  the join context happens to correspond to the Group By context (how a Question field will be grouped).
 *  The term "Group By" is a more recognized, standard SQL terminology compared to "Join Context".
 *  Because of this, join contexts are presented to the user as "Group By" contexts/variables
 *  rather than "Join" contexts/variables. 
 *  
 *  5) The "join key" is the list of fields which are used for joins.
 *     The join key contains the following fields in this order:
 *     
 *     [
		  Other-related column (optional - only defined for queries that have an "Other" join context),
		  FormTableRow (the Collector table row associated with this record, if applicable - could be null),
		  Owner (default),
		  ModuleId (optional - only defined for queries with a "Module" or "Form" join context), 
		  FormId (optional - only defined for queries with a "Form" join context)
		]
		
	   Each record in a CouchDB query resultset will include these 5 fields as the first fields in the record, regardless of whether or not they are optional for the query.
	   When they are optional, they will show up as null in the resultset.
 * 
 */
/***********************************************/

// Set up join contexts
function updateJoinContext( qId ){
	var joinContextElmId = 'seljoin_' + qId; // join context element ID	
	var joinContextOtherElmContainerId = 'otherJoinTxt_' + qId; // join context "Other" container ID	
	var joinContext = jQuery('#'+joinContextElmId).val();// selected join context for this question
		
	// if this question is being used as a join context variable, then 
	// the join context must be 'module' or 'form'
	var isJoinVariable;
	jQuery('[id^=seljoinother_]').each(function(){ 
		isJoinVariable = ( this.value == qId && joinContext == 'other');
		return ! isJoinVariable; // if isJoinVariable is true then this will break out of the loop
	});
	
	if ( isJoinVariable && ! arrayContains(['module','form'], joinContext ) ) {
		jAlert('Only Group By contexts <b>Module</b> and <b>Form</b> are permitted for this question<br/>(it is being used as a Group By variable).');
		jQuery('#' + joinContextElmId).val('module'); // set the join context to "Module" by default
	}
	
	// else, if this question is an autogenerated field, then 
	// the join context must be from the predefined set of join contexts for that field
	else if ( isAutogeneratedField( qId ) ){
		var requiredJoinContext = autogeneratedQuestionFieldJoinContexts[ getQuestionShortName(qId) ];
		if ( joinContext != requiredJoinContext ){
			jAlert('Only Group By context <b>' + requiredJoinContext + '</b> is permitted for this question.');
			jQuery('#' + joinContextElmId).val(requiredJoinContext); // reset the join context
		}
	}
	
	// else if join context = "other":
	else if ( joinContext == 'other' ){		
		//display the Join Context "Other" Variable entry form
		displayJoinContextForm(qId);
	}	
	// else:
	else{
		// show the spinner for this question
		showSpinner('spinner_'+qId);
		
		// clear the join context for "Other" for this question
		clearLocalJoinContextForOther( qId );
		
		// if joinContext = module
		if ( joinContext == 'module' ) {
			finalizeJoinContextSelection(qId,'module');		
		}

		// if joinContext = form
		else if ( joinContext == 'form' ) {
			finalizeJoinContextSelection(qId,'form');
		}
		
		// hide the spinner for this question
		hideSpinner('spinner_'+qId);
	}
}

// this clears the join context "Other" variable associated with this question
function clearLocalJoinContextForOther( qId ) {
	// show the spinner for this question
	showSpinner('spinner_'+qId);
	
	simulateBrowserUpdate('seljoinother_'+qId,'');
	
	// if the selected join context is still "other", then reset the join context
	if ( jQuery('#seljoin_' + qId).val() == 'other' ) jQuery('#seljoin_' + qId).val('default');
	
	// if there are no remaining questions which have their join context set to other,
	// then reset the DOM element which stores the current value of the "other" join context
	if ( jQuery('[id^=seljoin_] option:selected[value=other]').length == 0 ) 
	{
		jQuery('#tmpJoinContextOther').val('');
	}
	
	// hide the spinner for this question
	hideSpinner('spinner_'+qId);
}

// this refreshes the join context "Other" section as appropriate
// (showing/hiding, displaying the join variable's question short name, etc.)
function refreshJoinContextOtherSection( qId ){
	// set up variables
	var otherJoinSectionElm = jQuery('#otherJoinTxt_' + qId);
	var otherJoinVar = jQuery('#seljoinother_' + qId).val();
	var showOrHide = ! isEmptyString( otherJoinVar );
	
	// refresh the screen appropriately
	otherJoinSectionElm.toggle( showOrHide );
	// update the descriptive text for this join context
	setOtherJoinContextDescriptiveText( qId );
}

function setOtherJoinContextDescriptiveText( qId, joinQId, joinContext ) {
	var otherJoinVarText = '';
	if ( !joinQId ) joinQId = jQuery('#seljoinother_' + qId).val();
	if ( ! isEmptyString( joinQId ) ){
		otherJoinVarText = getQuestionShortName( joinQId );
		if ( ! joinContext ) joinContext = getQuestionSelectedJoinContext( joinQId );
		if ( !!joinContext ) {
			var joinContextLabel = jQuery('#seljoin_' + qId + ' option[value=' + joinContext + ']').text();
			otherJoinVarText += ',' + joinContextLabel;
		}
	}
	
	// set the descriptive text
	var otherJoinVarTextElm = jQuery('#seljoinothertxt_' + qId);
	otherJoinVarTextElm.html( otherJoinVarText );
}

// this function iterates through all the join context "Other" selections
// to confirm whether or not they are valid
function validateAllJoinContexts(){
	var errorMsgStr = '';
	
	// 1. Validate each join variable selection independently
	getAllJoinContextSelections().each( function(){	
		var qId = this.id.replace('seljoin_','');
		var qShortName = getQuestionShortName( qId );
		var otherJoinQId = jQuery('#seljoinother_'+qId).val();
		var err = validateJoinContext(qId,otherJoinQId);
		if ( ! isEmptyString( err ) ) errorMsgStr += '-<b>' + qShortName + '</b>: ' + err;	
		else {
			if ( ! isEmptyString( otherJoinQId ) && ! arrayContains( otherContextJoinVariables, otherJoinQId )) {
				otherContextJoinVariables.push( otherJoinQId );
			}
		}
	});	
	
	// 2. Validate that there is no more than one join variable
	// (For now only 1 is permitted)
	if ( otherContextJoinVariables.length > 1 ) {
		errorMsgStr += "-No more than 1 Group By variable is permitted for the <b>Other</b> Group By context.<br/>";
	}

	// 3. Validate that the join variable has been included as an independent/filter variable
	if ( otherContextJoinVariables.length > 0 && 
		(!arrayContains( ['independent','filter'],getQuestionSelectedVariableType( otherContextJoinVariables[ 0 ] ) ) || 
		 !isQuestionSelected( otherContextJoinVariables[ 0 ] ))){
		errorMsgStr += "-The Group By variable <b>" + getQuestionShortName(otherContextJoinVariables[ 0 ]) + "</b> should be included as one of the query variables, or it should no longer be made a Group By variable.<br/>";
	}
	
	return errorMsgStr;
}

// this function returns a list of the DOM elements representing
// all selected join contexts
function getAllJoinContextSelections(){
	return jQuery('[id^=seljoin_]');
}

//this function checks whether or not this join variable is valid in the current query
function validateJoinContext(qId,otherJoinQId){
	var errorMsgStr = '';
	var joinContext = jQuery('#seljoin_'+qId).val();
	
	if ( isQuestionSelected( qId )) {	
		// 1. Validate that the field selected as the join variable
		// is not the same as the current question
		if ( qId == otherJoinQId ) {
			errorMsgStr += '-A question cannot select itself as the Group By variable.<br/>';
		}
		
		// 2. Validate that when "Other" has been selected as the join context,
		// the "Other" value field is not blank
		if ( joinContext == 'other' && isEmptyString( otherJoinQId ) ) {
			errorMsgStr += '-When the Group By context is <b>Other</b>, a question must be selected as the Group By variable.<br/>';
		}
		
		// 3. Validate that when "Other" has not been selected as the join context,
		// the "Other" value field is blank
		if ( joinContext != 'other' && ! isEmptyString( otherJoinQId ) ) {
			errorMsgStr += '-A question may only be selected as a Group By variable when the Group By context is <b>Other</b>.<br/>';
		}
		
		// 4. Validate that the selected join variable is not a dependent variable
		if ( getQuestionSelectedVariableType( otherJoinQId ) == 'dependent' ) {
			errorMsgStr += '-Dependent variables may not be selected as Group By variables.<br/>';
		}
		
		// 5. Validate that the selected join variable is not an autogenerated field
		if ( isAutogeneratedField( otherJoinQId ) ){
			errorMsgStr += '-Autogenerated fields may not be selected as Group By variables.<br/>';
		}
		
		// 6. Validate that when "Module" has been selected as the join context,
		// the "Module" autogenerated field has been selected
		if ( joinContext == 'module' && !isQuestionSelected( getQuestionIdForShortName('Module'))){
			errorMsgStr += '-The field <b>Module</b> should be selected when the Group By context is "Module".<br/>';
		}
		
		// 7. Validate that when "Form" has been selected as the join context,
		// the "Form" autogenerated field has been selected
		if ( joinContext == 'form' && !isQuestionSelected( getQuestionIdForShortName('Form'))){
			errorMsgStr += '-The field <b>Form</b> should be selected when the Group By context is "Form".<br/>';
		}
	}
	return errorMsgStr;
}

//this sets up the form allowing the user to specify a variable to use
//as the join context for a question
//(currently displayed when the user selects "Other")
function setUpJoinContextForm(qId){
	var qShortName = getQuestionShortName(qId); // question short name
	var joinQId = jQuery('#tmpJoinContextOther').val(); // join variable's question ID
	var joinQShortName = getQuestionShortName(joinQId) ; // join variable's short name
	if ( ! joinQShortName ) joinQShortName = '';
	
	// Construct the Join Context Form
	if ( jQuery("#joinContextForm").length == 0 ) {
		var htmlStr = "<form id=\"joinContextForm\" style=\"display:none;\">";
		htmlStr += "<div id=\"join_context_spinner\" class=\"spinner\" style=\"display:none;\">&nbsp;</div>";
		htmlStr += "<div class=\"guidance\">Select a variable to use for grouping ";
		htmlStr += "<span id=\"textFld1\" class=\"highlighted\">" + qShortName + "</span>.</div>";
		htmlStr += "<div class=\"subsection2\" style=\"display:none;\">";
		htmlStr += "<div class=\"guidance3\">Previously selected: <span class=\"selected\"";
		htmlStr += " onclick=\"populateSearchFieldWithToken();\">" + joinQShortName + "</span>";
		htmlStr += "</div></div>";
		htmlStr += "<span class=\"red-asterisk\">*</span>";
		htmlStr += "<input type=\"text\" name=\"otherJoinContextValueFld\" id=\"otherJoinContextValueFld\" class=\"text ui-widget-content ui-corner-all\" value=\"\" />";
		htmlStr += "<span class=\"dropdownIcon\" onclick=\"joinContextAutoCompleter('search');\">&nbsp;&nbsp;&nbsp;&nbsp;</span>";
		htmlStr += "<input type=\"hidden\" id=\"joinContextCurrentJoinQuestionText\" value=\"" + joinQShortName + "\"/>";
		htmlStr += "<input type=\"hidden\" id=\"joinContextCurrentQuestion\" value=\"" + qId + "\"";
		htmlStr += "<div class=\"subsection\" style=\"display:none;\">";
		htmlStr += "<div class=\"guidance2\">Group ";
		htmlStr += "<span id=\"textFld2\" class=\"highlighted\"></span> by</div>";
		htmlStr += "<input type=\"radio\" name=\"otherJoinContextJoinFld\" value=\"module\" checked/>Module&nbsp;";
		htmlStr += "<input type=\"radio\" name=\"otherJoinContextJoinFld\" value=\"form\"/>Form";
		htmlStr += "</div>"
		htmlStr += "</form>";
		jQuery("#table_container").append(htmlStr);
		joinContextAutoCompleter('setup');
	}
	
	// Update the values in the Join Context form 
	// for the current question
	jQuery("#joinContextCurrentQuestion").val(qId);
	jQuery("#joinContextForm #textFld1").html(qShortName);
	jQuery('#joinContextForm div.subsection').hide();
	jQuery("#joinContextForm #textFld2").html('');
	jQuery('#joinContextForm [name=otherJoinContextJoinFld]').attr('checked',false);
	jQuery('#joinContextForm [name=otherJoinContextJoinFld][value=module]').attr('checked',true);
	jQuery('#joinContextCurrentJoinQuestionText').val(joinQShortName);
	if ( !!joinQId ) {
		jQuery('#joinContextForm div.subsection2').show();
		jQuery('#joinContextForm span.selected').text(joinQShortName);
	} else{
		jQuery('#joinContextForm div.subsection2').hide();
		jQuery('#joinContextForm span.selected').text('');
	}
	
	// Create and display the dialog box within which the Join Context form will be displayed
	jQuery('#joinContextForm').dialog({
		width: 500,height:350,title:"Select Group By Variable",modal:true,autoOpen:false,buttons:{
		"Make Selection" : function(){
			// show the spinner
			showSpinner('join_context_spinner');
		
			// update the join context's "Other" value to 
     		// the value of the "tmpJoinContextOther" field
			var joinQId = jQuery('#tmpJoinContextOther').val();
			if ( ! joinQId  ) joinQId = '';
			finalizeJoinContextSelectionForOther( qId, joinQId );
			
			// hide the spinner
			hideSpinner('join_context_spinner');
		
			// clear out all form fields and close the dialog box
			jQuery("#otherJoinContextValueFld").val('');
			jQuery('#joinContextForm').dialog('close');
		},
		"Clear Selection": function(){
			if ( isEmptyString( getQuestionSelectedJoinVariableForOther( qId )) ){
				jAlert("Nothing was selected.","EMPTY SELECTION");
			}
			else {
				jConfirm("Are you sure you want to reset your previous selection?", "Confirmation", function(r){
					if ( r ) {
						jQuery("#otherJoinContextValueFld").val('');
						clearLocalJoinContextForOther(qId);
						jQuery('#joinContextForm').dialog('close');
					}
				});
			}
		},
		"Cancel" : function(){			
			// clear out all form fields and close the dialog box
			jQuery("#otherJoinContextValueFld").val('');
			// reset the join context for the question if applicable
			if ( isEmptyString( getQuestionSelectedJoinVariableForOther( qId )) ){
				clearLocalJoinContextForOther(qId);
			}
			jQuery('#joinContextForm').dialog('close');
		}}
	});
}

// this displays the Join Context form
function displayJoinContextForm(qId){
	setUpJoinContextForm(qId);
	jQuery('#joinContextForm').dialog('open');
}

// Function which will populate the search field on the join context form with this token
function populateSearchFieldWithToken(){
	var searchToken = jQuery('#joinContextCurrentJoinQuestionText').val();
	joinContextAutoCompleter('search',searchToken );
}

// Function which handles showing/hiding 
// the section of the Join Context form that displays the join variable's join context
function refreshJoinContextForm(text,showOrHideFlag){
	if ( showOrHideFlag == 'show' ) {
		jQuery('#joinContextForm div.subsection').show(1100);
		jQuery("#joinContextForm #textFld2").html(text);
	}
	else {
		jQuery('#joinContextForm div.subsection').hide('fast');
		jQuery("#joinContextForm #textFld2").html('');
	}
}

//Function which handles autocompletion
function joinContextAutoCompleter(flag,searchToken){
	var input = jQuery("#otherJoinContextValueFld");
	var currentQId = jQuery('#joinContextCurrentQuestion').val();
	if ( flag == 'search' ) { 
		if ( input.autocomplete( 'widget' ).is( ':visible' ) ) {
			input.autocomplete( 'close' );
			return;
		}
		
		if ( searchToken ) input.autocomplete( 'search', searchToken );
		else input.autocomplete( 'search' );
		
		input.focus();
	} 
	else if ( flag == 'setup' ){ // initializes autocomplete
		input.autocomplete( { source: getFullListOfQuestions(), minLength: 0 });
		
		input.bind('autocompleteselect', function( event, ui ){
			var joinQId = ui.item ? ui.item.questionId : '';	
			var joinQText = ui.item ? ui.item.label : '';
			var currentQId = jQuery('#joinContextCurrentQuestion').val();

			// validate whether the selected join variable can be used
			var returnVal = updateJoinContextForOther( currentQId, joinQId );
			// refresh the Join Context form as appropriate
			refreshJoinContextForm( joinQText, returnVal ? 'show' : 'hide');
			// return (if the return value is false then any selection will be de-selected)
			return returnVal;
		});
		
		input.bind('autocompleteclose', function( event, ui ){
			// If nothing was selected from the autocomplete dropdown, then clear the bottom section of the form
			var selectionElm = jQuery("#joinContextForm #textFld2");
			var wasSelectionMade = (input.val() == selectionElm.text());
			if ( ! wasSelectionMade ){
				var joinQId = '';
				var joinQText = '';
				refreshJoinContextForm( joinQText, 'hide');
				return true;
			}
		});
	}
}

function updateJoinContextForOther( qId, joinQId ){
	// if the joinQId is blank then return
	if ( isEmptyString( joinQId ) ) {
		return false;
	}
	
	// else if the join variable is invalid then prompt the user as appropriate
	var errorMsg = validateJoinContext( qId, joinQId );
	if( ! isEmptyString( errorMsg ) ){
		jAlert(errorMsg,"Invalid Variable Selection");
		// clear out the "Other"-related join context field
		jQuery("#otherJoinContextValueFld").val('');
		return false;
	}
	
	// else proceed	
	var existingJoinVars= jQuery('input[id^=seljoinother_][value!=\'\'][value!=\'' + joinQId + '\']');
	
	// Prevent the user from adding more than one join variable to the query		
	if ( existingJoinVars.length > 0 ) {
		var existingJoinVarQId =  existingJoinVars[ 0 ].value;
		var existingJoinVarShortName = getQuestionShortName( existingJoinVarQId );
		var joinVariableShortName = getQuestionShortName( joinQId );
		var msg = "<b>" + existingJoinVarShortName + "</b>";
		msg += " has already been selected as a Group By variable.";
		msg += "<br/><br/>You may not select more than <b>1</b> question as the Group By variable."
		msg += "<br/><br/>Do you want to reset the Group By variable to <b>" +  joinVariableShortName + "</b>?";
		jConfirm(msg,"Invalid Variable Selection",function( r ){
			// If the user clicks "OK", then proceed to update the join context "Other" sections
			if ( r ) prefinalizeJoinContextSelectionForOther(qId,joinQId);
			else {
				// clear out the "Other"-related join context field
				jQuery("#otherJoinContextValueFld").val('');
				return false;
			}
		});
	} else{
		prefinalizeJoinContextSelectionForOther(qId,joinQId);
	}
	
	// return true; this means that the selected variable's value was saved
	// and could be used as the new join variable
	return true;
}

// function which updates the DOM element which stores the current join variable selection
// NOTE: The current join variable selection will NOT be finalized
// until the user clicks "Done" or "Cancel" on the form.
function prefinalizeJoinContextSelectionForOther(qId,joinQId){
	if (jQuery('#tmpJoinContextOther').length==0){
		jQuery("#joinContextForm")
			.append("<input type=\"hidden\" id=\"tmpJoinContextOther\" value=\"\">");
	}
	
	jQuery('#tmpJoinContextOther').val(joinQId);
}

function finalizeJoinContextSelection(qId,joinContext){
	var shortname = ( joinContext == 'module' ? 'Module' : (joinContext == 'form' ? 'Form' : null));
	if ( shortname ) {
		// Add the Module or Form question to the set of variables for this query
		var moduleOrFormQId = getQuestionIdForShortName( shortname );
		if ( !isQuestionSelected(moduleOrFormQId) ){
			// update the question checkbox
			simulateBrowserUpdate('check_'+moduleOrFormQId,true);
			
			//update the question's variable type
			simulateBrowserUpdate('select_'+moduleOrFormQId,'filter');
			
			//update the join context
			simulateBrowserUpdate('seljoin_'+moduleOrFormQId, joinContext, true );			
		}
		// If this is a join variable then make appropriate updates
		// to all the questions that use this join variable
		var otherJoinVariableElms = jQuery('[id^=seljoinother_]');
		otherJoinVariableElms.each(function(){
			if ( this.value == qId ) { // means that qId is an "Other"-related join variable
				if ( !!joinContext ){
					var targetQId = this.id.replace('seljoinother_','');
					setOtherJoinContextDescriptiveText( targetQId, qId, joinContext );
				}
			}
	   });
	}
}

// function which does a global update of all the "Other"-related join contexts
// based on the given parameters
function finalizeJoinContextSelectionForOther(qId,joinQId){
	// Update the "Other" join context field for this question
	simulateBrowserUpdate( 'seljoinother_'+qId, joinQId );
	
	// if joinQId is not blank, then update the remaining "Other" join context fields
	if ( !isEmptyString( joinQId ) ) {
		// if the join variable has not yet been added to the query,
		// then make it a new filter variable
		var joinVariableType = getQuestionSelectedVariableType(joinQId);
		if ( ! joinVariableType || !isQuestionSelected( joinQId )) {
			// update the question checkbox
			simulateBrowserUpdate('check_'+joinQId,true);
			
			//update the question's variable type
			simulateBrowserUpdate('select_'+joinQId,'filter');
		}
		
		//update the join variable's join context
		var joinQContext = jQuery('[name=otherJoinContextJoinFld]:checked').val();
		if ( isEmptyString( joinQContext ) ) joinQContext = 'module';
		simulateBrowserUpdate('seljoin_'+joinQId, joinQContext );	
				
		// update the remaining "Other" join context fields
		jQuery('input[type=text][id^=seljoinother_][id!=seljoinother_' + qId + ']').each( function(){
			if ( jQuery('#'+this.id.replace('other_','_')).val() == 'other'){
				simulateBrowserUpdate( this.id, joinQId );
			}
		});
	}
}

// Function which sets the join context of the given questionId and joinContext as "Other"
function updateJoinContextAsOther( qId, joinQId ) {
	if ( qId && joinQId ) {
		setUpJoinContextForm(qId);
		prefinalizeJoinContextSelectionForOther( qId, joinQId );
		finalizeJoinContextSelectionForOther( qId, joinQId );
	}	
}

// END setting up JOIN CONTEXTS

/*******************************************************/
/** Functions for processing JOIN CONTEXTS in a query  */
/*******************************************************/

// returns the join key between the "Other" related join variable, if any,
// and this question
function getJoinKeyBetweenOtherRelatedJoinVariableAndQuestion(qId){
	return getJoinKeyForOtherRelatedJoinVariable();
}

// returns the join key for the "Other" related join variable
function getJoinKeyForOtherRelatedJoinVariable(){
	var other = getOtherRelatedJoinVariable();
	var joinContext = getQuestionSelectedJoinContext(other); // the "Other" variable's join context
	var tableContext = hasTableContext(other); // whether the "Other" is associated with a Form Table
	return getJoinKey( joinContext, null, tableContext );
	
}

// returns the join key for the given question
function getJoinKeyForQuestion(qId){
	var joinContext = getQuestionSelectedJoinContext(qId); // the question's join context
	var otherJoinContext = getOtherRelatedJoinVariable(); // the current query's "Other"-related join variable, if applicable
	var tableContext = hasTableContext(qId); // whether the question is associated with a Form Table
	return getJoinKey( joinContext, otherJoinContext, tableContext );
}
// returns the join key for the given join context variables.
// The structure will look like this: 
//   [
//       Other-related column  (optional - only exists for queries that have an "Other" join context),
//       FormTableRow (optional),
//       Owner,
//       ModuleId (optional), 
//       FormId (optional)
//   ]
function getJoinKey( joinContext, otherJoinContext, includeTableContext ) {
	var joinKeyArray = new Array(); // the question's join key
	
	// First, add column for the "Other"-related join context, if applicable
	if ( otherJoinContext ){
		var columnName = getJoinColumnName( otherJoinContext );
		joinKeyArray.push( columnName );
	}
	
	// Next, add columns for the non-"Other"-related join context 
	for ( var i = 0; i < joinContextArray.length; ++i ){ 
		var currentJoinContext = joinContextArray[ i ];
		var columnName = getColumnNameForContext( currentJoinContext );
		if ( i == 0 ) {
			// Add column for "FormTableRow" if this join key will be associated with table context
			if ( includeTableContext ) {
				joinKeyArray.push( 'FormTableRow' );
			}
		}
		else if ( i==1){
			joinKeyArray.push( columnName ); // join key will always include "Owner"
		}
		else if ( findMostRestrictiveJoinContext( [ currentJoinContext, joinContext ] ) == joinContext ) {
			joinKeyArray.push( columnName );
		}
	}
	
	// return the join key
	return joinKeyArray;
}

// gets the column name for the given context
function getColumnNameForContext( contextVar ) {
	var columnName;
	var oHsh = joinContextFieldMap;
	
	if ( oHsh[ contextVar ] ) {
		columnName = oHsh[ contextVar ];
	}
	else { // means the join context must be "Other"		
		columnName = getFormattedColumnNameForShortName( contextVar + '1' );
	}
	
	return columnName;
}

// gets the join context for the given column
function getJoinContextForColumn( columnName ) {
	var joinContext;
	var oHsh = joinContextFieldMap;
	
	for ( var ctx in joinContextFieldMap ) {
		if ( joinContextFieldMap[ ctx ] == columnName ){
			return ctx;
		}
	}
	
	return 'other';
}

// When executing a join between 2 question fields, this function determines which of the 2 fields should be used to determine the join context
function findJoinContextSource( qId1, qId2 ){
	if ( !qId1 ) return qId2;
	
	var qId1TableContext = hasTableContext( qId1 );
	var qId2TableContext = hasTableContext( qId2 );
	
	// Handle when both questions have the same table context
	if ( qId1TableContext == qId2TableContext ) {
		return qId2;
	}
	
	// Else:
	// 1) If either of the questions is a dependent variable, return the question field that DOES have table context.
	// 2) Otherwise, return the question field that does NOT have table context.
	// 
	// EXPLANATION OF LOGIC:
	//
	// When the question with table context is used in this case, it automatically means that the join will return no records (empty resultset).
	// This is because the join key fields will include the FormTableRow field, 
	// which will always be null for the question without table context,
	// and non-null for the question with table context.
	// Hence, joining on this field will never produce a match.
	// 
	// For the independent and filter variables, we DO want to be able to join non-table questions with table questions without producing an empty resultset.
	// Hence, we use the question field that does NOT have table context.
	//
	// For dependent variables, we only want to join table questions to independent/filter variables that are table questions from the same table.
	// Hence, we use the question field that DOES have table context.
	else {
		var tableContextQuestion   = ( qId1TableContext ? qId1 : qId2 );
		var noTableContextQuestion = ( qId1TableContext ? qId2 : qId1 );
		var includesDependentVariable = ( isDependentVariable( qId1 ) || isDependentVariable( qId2 ) );
		return ( includesDependentVariable ? tableContextQuestion : noTableContextQuestion );
	}
}


// gets the most restrictive join context for the current query,
// NOTE: this excludes any "Other"-related join context
function getMostRestrictiveJoinContextForCurrentQuery(){
	var currentQueryJoinContexts = 
		getAllSelectedQuestions().map( function(qId) {
			return getQuestionSelectedJoinContext( qId );
		});
	 
	return findMostRestrictiveJoinContext( currentQueryJoinContexts );
}

// gets the most restrictive possible join context
function getMostRestrictiveJoinContext(){
	return joinContextArray[ joinContextArray.length - 1 ];
}

function getMostRestrictiveJoinKey(qId){
	joinContext = getMostRestrictiveJoinContext();
	var otherJoinContext = getOtherRelatedJoinVariable(); // the current query's "Other"-related join variable, if applicable
	var tableContext = hasTableContext(qId); // whether the question is associated with a Form Table
	return getJoinKey( joinContext, otherJoinContext, tableContext );
}

// returns the most restrictive join context in the given array
function findMostRestrictiveJoinContext( arr ) {
	var mostRestrictive;
	if ( arr && arr.length > 0 ){
		mostRestrictive = arr[ 0 ];
		for ( var i = 1; i < arr.length; ++i ) {
			if ( jQuery.inArray( arr[ i ], joinContextArray ) > jQuery.inArray( mostRestrictive, joinContextArray ) ){
				mostRestrictive = arr[ i ];
			}
		}
	}
	return mostRestrictive;
}

// returns whether any question(s) in the current query have this join context selected
function findQuestionsWithJoinContext( joinContext ) {
	var qIds = [];
	getAllSelectedQuestions().each( function( qId ) {
		if ( getQuestionSelectedJoinContext( qId ) == joinContext ) {
			qIds.push( qId );
		}
	});
	return qIds;
}

// returns an array that could be used as the "keys" parameter for Google's visualization join operation
function buildGoogleJoinKey( joinKey ){
	var googleJoinKey = new Array();
	if ( allJoinColumns.length == 0 ) allJoinColumns = getAllJoinColumns();
	for ( var i = 0; i < joinKey.length; ++i ){
		var joinColumn = joinKey[ i ];
		var index = jQuery.inArray( joinColumn, allJoinColumns ); 
		googleJoinKey.push( [index,index] );
	}
	return googleJoinKey;
}

// returns the full set of join columns for the current query
// (will eventually be removed from the dataset in order to render the visualizations correctly)
//The structure will look like this: 
//[
//  Other-related column (optional - only exists for queries that have an "Other" join context),
//  FormTableRow,
//  Owner,
//  ModuleId, 
//  FormId
//]
function getAllJoinColumns(){
	var joinContext = getMostRestrictiveJoinContext();
	var otherJoinContextVar = (hasOtherJoinContextSelected() ? 
			               getOtherRelatedJoinVariable() :
			               null);
	
	return getJoinKey( joinContext, otherJoinContextVar, true );
}

// returns whether or not a join context of "Other" has been selected for the current query
function hasOtherJoinContextSelected(){
	return ( otherContextJoinVariables.length > 0 ) ;
}

// returns the join column name of this question
function getJoinColumnName(qId) {
	if ( qId ) {
		var otherJoinContextShortName = getQuestionShortName( qId );
		var columnName = getColumnNameForContext( otherJoinContextShortName );
		return columnName;
	}
}

// returns the question Id of the "Other"-related join variable for this query
function getOtherRelatedJoinVariable(){
	if ( otherContextJoinVariables.length > 0 ) {
		return otherContextJoinVariables[ 0 ];
	}
}

/*******************************************************/
/** END processing JOIN CONTEXTS in a query            */
/*******************************************************/
// Populate CONFIRMATION BOX
function updateConfirmationBox(qId,ansCheckId){
	var quesCheckId = 'check_' + qId;
	var quesAnchorId = 'anchor_' + qId;
	var answerConfirmationTextId = 'txt_' + ansCheckId;
	var quesIndDepBoxTextClass = 'inddeptxt_' + qId;
	var indDepSelectDropdownId = 'select_' + qId;
	var answerSetDivId = 'answers_' + qId;
	var aggregationBoxId = 'aggregation_' + qId;
	var aggregationBoxClass = 'aggtn_' + qId;
	var isAnswerCheckboxSelected = (ansCheckId.indexOf('ans_') == 0);
	var isQuestionCheckboxSelected = !isAnswerCheckboxSelected;
	// Determine the fieldset to which the selection should be added (Independent box,Dependent box or Filter box)
	var variableType = jQuery('#'+indDepSelectDropdownId).val();
	var indDepBoxId = variableType+'QtnSet';
	var helpContainerContentId = 'help_container_content';
	var autogenerated = isAutogeneratedField( qId );
	
	// if this is a saved report, then show the report title
	updateSavedReportTitleSection(helpContainerContentId);
	
	// hide or show all answer checkboxes for this question
	// based on the value of the independent/dependent/filter dropdown
	showOrHideAnswerCheckboxes(qId);
	
	if ( jQuery('#' + ansCheckId).is(':checked') ) { // It means a question/answer checkbox has been selected
		
		// Hide "NONE" in the appropriate Independent/Dependent/Filter box
		jQuery( '#' + indDepBoxId + ' li.none').hide();
		
		// Remove the selection's aggregation box if it exists
		removeAggregationBox( qId );
		
		// Remove the selection's text from the confirmation section if it exists
		jQuery( '.' + quesIndDepBoxTextClass ).remove();
		
		// Add the text to the appropriate Independent/Dependent/Filter box in the confirmation section
		var quesIndDepBoxText = "<li class=\"" + quesIndDepBoxTextClass + "\"><a href=\"#\" onclick=\"goToQuestionAnchor('" + quesAnchorId + "')\">" + jQuery('#' + quesCheckId).val() + "</a>" + "<ul class=\"answers\"></ul></li>";
		if ( autogenerated ) jQuery( '#' + indDepBoxId ).append( quesIndDepBoxText );
		else jQuery( '#' + indDepBoxId ).prepend( quesIndDepBoxText );
		
		// Add a blinking effect to the newly added text
		doBlink('.'+quesIndDepBoxTextClass);
		
		// Add all selected answers (if any) to the appropriate box
		// IF this is a dependent variable
		if ( variableType == 'dependent'){
			jQuery( '#' + answerSetDivId + ' div input[type=checkbox]:checked').each(function(){
				jQuery( '.' + quesIndDepBoxTextClass + ' ul.answers').append("<li>" + jQuery(this).val() + "</li>");
			});
		}
		
		// Add an Aggregation Type section to the appropriate box
		// IF this is a dependent variable
		//TODO: Allow aggregations for independent/filter variables as well
		if ( variableType == 'dependent' ) {
			addAggregationBox( qId );
		}
	}
	else{// It means a question/answer checkbox has been deselected
		if ( isQuestionCheckboxSelected ) {
			// Remove the selection's text from the confirmation section if it exists
			jQuery( '.' + quesIndDepBoxTextClass ).remove();
			// Remove the selection's aggregation box if it exists
			removeAggregationBox( qId );
		}
		else {
			var answerValue = jQuery('#'+ansCheckId).val();
			jQuery("." + quesIndDepBoxTextClass + " li:contains('" + answerValue +"')").remove();
		}
	}
	
	// Show "NONE" in the appropriate Independent/Dependent/Filter box
	// if all the questions/answers were deselected for this box
	if ( jQuery('#independentQtnSet li[class!=none]').length==0 ) 
		jQuery( '#independentQtnSet li.none').show();
	if ( jQuery('#dependentQtnSet li[class!=none]').length==0 ) 
		jQuery( '#dependentQtnSet li.none').show();
	if ( jQuery('#filterQtnSet li[class!=none]').length==0 ) 
		jQuery( '#filterQtnSet li.none').show();
}

// Updates the data type associated with a question
function updateDataType(qId,selectedDataType){
	var htmlStr = '';
	
	// Reset the data type if applicable
	if ( selectedDataType ) {
		jQuery('#seldata_' + qId).val(selectedDataType);
	}
	
	// Determine whether or not to display a warning
	if (!selectedDataType) selectedDataType = getQuestionSelectedDataType(qId);	
	var total = getTotalNumForQuestionAndDataType( qId, 'string' );
	var selectedTotal = getTotalNumForQuestionAndDataType( qId, selectedDataType );
	if ( !isNaN( total ) && total > 0 ) {
		// if none of the data fits the selected data type, 
		// then alert the user and reset the selected data type
		if ( selectedTotal == 0 || isNaN( selectedTotal ) ) {
			htmlStr = "No " + selectedDataType + "s were found for \"" + getQuestionShortName(qId) + "\".";
			jAlert(htmlStr);
			setQuestionSelectedDataType(qId,'string');
		}
		// else, if only some of the data does not fit the selected data type, then 
		// alert the user and reset the selected data type
		else if ( !isNaN( selectedTotal) && selectedTotal < total ) {
			var truncatedPercentage = Math.round(((total-selectedTotal)/total) * 100);
			if ( truncatedPercentage == 0 ) truncatedPercentage = ((total-selectedTotal)/total) * 100;
			htmlStr  = "<b>WARNING</b>: By selecting \"" + selectedDataType + "\", " + 
			truncatedPercentage + 
			"% of the data will not be displayed.";
			jAlert(htmlStr);
			setQuestionSelectedDataType(qId,'string');			
		}
	}
	
	// for dependent variables, reset the aggregation box section
	var isDependentQuestion = jQuery('#select_' + qId).val() == "dependent";
	if ( isDependentQuestion ) {
		removeAggregationBox( qId );	
		addAggregationBox( qId );
	}
	
	// add display options to the question as appropriate
	addQuestionDisplayOptions( qId );
	
}

//Function which determines the total number of records for this question and datatype
function getTotalNumForQuestionAndDataType( qId, dataType ) {
	var total; 
	
	var nonTableTotalSelected = questionDataTypes[ qId + PIPES + dataType ];
	var tableTotalSelected = questionDataTypes[ qId + PIPES + dataType + 'table' ];
	
	if ( !nonTableTotalSelected ) nonTableTotalSelected = 0;
	if ( !tableTotalSelected ) tableTotalSelected = 0;
	
	if ( !hasTableContext( qId ) ) // no table context
	{ 
		total = nonTableTotalSelected;
	}	
	else 
	{
		var tableContextType =  getFormTableContextTypeForQuestion( qId );	
		
		if ( tableContextType == getTableDataOnlyContextType() ) { // only table data
			total = parseInt(tableTotalSelected);
		}
		
		else if ( tableContextType == getTableAndNonTableContextType() ) { //both table and non-table data
			total = parseInt(nonTableTotalSelected) + parseInt(tableTotalSelected);
		}
		
		else { // only non-table data
			total = parseInt(nonTableTotalSelected);
		}
	}
	
	return total;
}

// adds display options to the question as appropriate
function addQuestionDisplayOptions( qId )
{
	var selectDivElmId = 'selectdiv_' + qId;
	var dateQuestionTypeElmId = 'dateQuestionType_' + qId;
	var dateShowElmId = "dateSelDataShow_" + qId;
	var dateFormatElmId = "dateSelDataFormat_" + qId;	
	var dateFormatSpanElmId = "dateSelDataFormatSpan_" + qId;
	
	var selectedDataType = getQuestionSelectedDataType(qId);
	
	// refresh the question type display options
	jQuery("#" + dateQuestionTypeElmId ).remove();
	
	if ( selectedDataType == 'date' ){ // Date
		var selectDivElm = jQuery( '#' + selectDivElmId );
		var htmlStr = "<fieldset id=\"" + dateQuestionTypeElmId + "\" class=\"questionTypeDisplay\">";
		htmlStr += "<legend>Display Options</legend>&nbsp;Show the&nbsp;&nbsp;<br/><br/>"
		htmlStr += "<select id=\"" + dateShowElmId + "\" class=\"questionDateDisplay\" onchange=\"updateDateFormatOptions('" + qId + "')\">";
		for ( var i = 1; i <= dateDisplayOpts.length; ++i )
		{
			htmlStr += "<option value=" + i + " title=\"" + dateDisplayOptHovers[i-1] +"\">" + dateDisplayOpts[i-1] + "</option>";
		}
		htmlStr += "</select>&nbsp;using&nbsp;<br/><br/><span id =\"" + dateFormatSpanElmId + "\" class=\"questionDateFormatWrapper\">";
		htmlStr += "<select id=\"" + dateFormatElmId + "\" class=\"questionDateFormat\">";
		for ( var i = 1; i <= dateFormatOpts.length; ++i )
		{
			htmlStr += "<option value=" + i + " title=\"" + dateFormatOptHovers[i-1] +"\">" + dateFormatOpts[i-1] + "</option>";
		}
		htmlStr += "</select>&nbsp;format</span>";
		htmlStr += "</fieldset>";
		jQuery( '#' + selectDivElmId ).append(htmlStr);
	}
}

// updates the date format options based on the selected date transformation type
function updateDateFormatOptions(qId) {
	var dateShowElmId = "dateSelDataShow_" + qId;
	var dateFormatElmId = "dateSelDataFormat_" + qId;	
	var dateFormatSpanElmId = "dateSelDataFormatSpan_" + qId;
	var transformationType = jQuery("#"+dateShowElmId).val();
	
	var mappings = { 1: [0,1,2,3,4,5,6], 2 : [2,4] };
	if ( mappings[ transformationType.toString() ]) {
		var opts = mappings[ transformationType.toString() ];
		jQuery("#"+dateFormatSpanElmId).show();
		var optionsHtml = '';
		for ( var i = 0; i < opts.length; ++i )
		{
			var formatIndex = opts[i];
			var val = parseInt(formatIndex)+1;
			optionsHtml += "<option value=" + val + " title=\"" + dateFormatOptHovers[formatIndex] +"\">" + dateFormatOpts[formatIndex] + "</option>";
		}
		jQuery("#"+dateFormatElmId).html(optionsHtml);
	}
	else {
		jQuery("#"+dateFormatSpanElmId).hide();
	}
}

// redirects the user to the question indicated by the provided anchor
function goToQuestionAnchor(anchor){
	var isHomePageLoaded = jQuery('#table_container').is(':visible');
	if ( !isHomePageLoaded ){
		// Alert the user to go to the "Create Reports" screen
		jAlert('<b>To view a question selection, you must be on the "Create Reports" screen.</b>','ALERT');
	}

	else {
		var isAnchorVisible = jQuery('a[name='+anchor+']').is(':visible');
		if ( !isAnchorVisible ) {
			jQuery('a[name='+anchor+']').parentsUntil('tr').parent().show();
		}
		
		window.location.hash = '#' + anchor;
		removeOverlayScreen();
	}
}
// end CONFIRMATION BOX

function loadjscssfile(filename, filetype){
	 if (filetype=="js"){ //if filename is a external JavaScript file
	  var fileref=document.createElement('script')
	  fileref.setAttribute("type","text/javascript")
	  fileref.setAttribute("src", filename)
	 }
	 else if (filetype=="css"){ //if filename is an external CSS file
	  var fileref=document.createElement("link")
	  fileref.setAttribute("rel", "stylesheet")
	  fileref.setAttribute("type", "text/css")
	  fileref.setAttribute("href", filename)
	 }
	 if (typeof fileref!="undefined"){
	  document.getElementsByTagName("head")[0].appendChild(fileref)
	}
}	

function getNumDependentVariableQuestions(){
	return jQuery('#dependentQtnSet li[class^=inddeptxt_]').length;
}

function getNumIndependentVariableQuestions(){
	return jQuery('#independentQtnSet li[class^=inddeptxt_]').length;
}

function getNumFilterVariableQuestions(){
	return jQuery('#filterQtnSet li[class^=inddeptxt_]').length;
}

function getNumColumnsForDependentQuestion( qId ) {
	if ( qId ) {
		// For numeric questions, only 1 column is returned (the aggregation of all numeric answers)
		// For non-numeric questions, 1 column is returned for each possible answer
		if( hasNumericDataType(qId) )
			return 1;
		else{
			if ( allJoinColumns.length == 0 ) allJoinColumns = getAllJoinColumns();
			for ( var i = 0; i < dependentVarArray.length; ++i ) {
				if ( dependentVarArray[i][0] == qId ) {
					var numColumns = dependentVarResultSetArray[i].getNumberOfColumns() - allJoinColumns.length;
					return numColumns;
				}
			}
		}
	}
}

function plusMinusClick(elem, answerSetDivId, qId){
	expandCollapse(elem, answerSetDivId);
	
	if(elem.className=='minusicon'){
		if(jQuery("#more_"+qId).length>0 && jQuery("#more_"+qId).hasClass("wasVisible")){
			showOrHideById("more_"+qId, 1);
		}
		if(jQuery("#less_"+qId).length>0 && jQuery("#less_"+qId).hasClass("wasVisible")){
			showOrHideById("less_"+qId, 1);
		}
	}
	else if(elem.className=='plusicon'){
		jQuery("#more_"+qId).removeClass("wasVisible");
		jQuery("#less_"+qId).removeClass("wasVisible");
		if(jQuery("#more_"+qId).is(":visible")){
			jQuery("#more_"+qId).addClass("wasVisible");
		}
		if(jQuery("#less_"+qId).is(":visible")){
			jQuery("#less_"+qId).addClass("wasVisible");
		}	
		if(jQuery("#more_"+qId).length>0){
			showOrHideById("more_"+qId, 0);
		}
		if(jQuery("#less_"+qId).length>0){
			showOrHideById("less_"+qId, 0);
		}
	}
}
function expandCollapse(srcElement,answerElmId){
	if ( srcElement.className=='minusicon' ) { //do a "collapse"
	    srcElement.className = 'plusicon';
	    srcElement.innerHTML = 'Show answers...';
		jQuery('#'+answerElmId).hide(1400);
	}
	else { // do an "expand"
		srcElement.className = 'minusicon';
	    srcElement.innerHTML = 'Hide';
		jQuery('#'+answerElmId).show(1400);
	}
}

/**
 * Reset global variables
 */
function resetGlobalVariables(){
	baseVarArray = new Array();
	baseVarResultSet = null;
	baseVarResultSetArray = new Array();
	dependentVarResultSetArray = new Array();
	baseVarColumnNames = new Array();
	dependentVarArray = new Array();
	dependentVarResultSet = null;
	joinedResultSet = null;
	groupedResultSet = null;
	destroyObject(filterControl);
	filterControl = null;
	reportVisualizations = null;
	primaryVisualizations = null;
	secondaryVisualizations = null;
	visualizationMismatchErrors = null;
	currentReportType = null;
	dataMismatchReportTypes = new Array();
	otherContextJoinVariables = new Array();
	otherContextJoinVarResultSet = null;
	otherContextJoinVarResultSetArray = new Array();
	allJoinColumns = new Array();
}

/**
 * Resets all join contexts
 */
function resetJoinContexts(){
	var joinContextElms = jQuery('[id^=seljoin_] option[value!=default]:selected').parent();
	joinContextElms.each( function(){
		// reset the join context to "default"
		jQuery(this).val('default');
		
		// get the question ID associated with this element
		var prefix = 'seljoin_';
		var qId = jQuery(this).attr('id').substring( prefix.length );
				
		// reset the "Other-" related join variable fields
		jQuery("#otherJoinContextValueFld").val('');
		
		// reset the join context for the question
		clearLocalJoinContextForOther(qId);
		
	});
}
/**
 * Determine if the user should be allowed to select this question
 */
function canMakeQuestionSelection(qId) {
	var canSelect = true;
		
	// Run the table context related validations
	var errorMsg = validateTableContexts( qId );
	//If running the validations resulted in the question's checkbox being deselected, then
	// display an alert to the user
	if ( !isEmptyString( errorMsg ) && !jQuery( '#check_' + qId ).is(':checked') ) {
		jAlert( errorMsg );
		canSelect = false;
	}
	
	return canSelect;
}

/**
 * Validate Query criteria
 */
function validateQueryCriteria() {
	// First reset the global variables
	resetGlobalVariables();
	
	var valid = true;
	
	var errorMessageString = 'The following issues were found:<br/>';
	
	// Next set up the base variable(s) (the associated question Id(s))
	var baseVarJQueryObj = jQuery('#independentQtnSet li[class^=inddeptxt_],#filterQtnSet li[class^=inddeptxt_]');
	baseVarJQueryObj.each(function() {
		var index = this.getAttribute('class').lastIndexOf('_')+1;
		baseVarArray.push(this.getAttribute('class').substring(index));
	});
	
	// Set up the dependent variables
	var elmId = null;
	var dependentVarJQueryObj = jQuery('#dependentQtnSet li[class^=inddeptxt_]');
	var numDependentQuestions = dependentVarJQueryObj.length;
	var dependentQuestionId = null;
	dependentVarJQueryObj.each( function() {
		var elmId = this.getAttribute('class');
		var index = elmId.lastIndexOf('_')+1;
		dependentQuestionId = elmId.substring(index);
		var dependentAnswerId = null;
		var answerObj = this.down('li');
		var ctr = 0;
		var hasAnswers = !!answerObj;
		if ( hasAnswers ){
			while ( answerObj ) {
				dependentAnswerId = answerObj.innerHTML;
				dependentVarArray.push([dependentQuestionId,dependentAnswerId]);
				answerObj = answerObj.next('li');
			}
		}
		else dependentVarArray.push([dependentQuestionId,dependentAnswerId]);
	});
		
	//1. Validate whether an independent variable has been provided
	if ( baseVarJQueryObj.length == 0 ){
		errorMessageString += '-Please select an independent variable.<br/>';
		valid = false;
	}
	
	//2. Validate the join context selections
	var joinContextErrors = validateAllJoinContexts();
	if ( ! isEmptyString( joinContextErrors ) ) {
		errorMessageString += joinContextErrors;
		valid = false;
	}
	
	// 3. Validate that no autogenerated fields were selected as dependent variables
	for ( var i = 0; i < dependentVarArray.length; ++i ){
		if ( isAutogeneratedField( dependentVarArray[i][0] ) ){
			var shortname = getQuestionShortName( dependentVarArray[i][0] );
			var errorStart = "-Autogenerated field <b>" + shortname + "</b>";
			if ( errorMessageString.indexOf(errorStart) == -1 ){
				errorMessageString += errorStart + " may not be selected as a dependent variable.<br/>";
			}
			valid = false;
		}
	}
	
	// 4. Validate the table context selections
	var tableContextErrors = validateTableContexts();
	if ( ! isEmptyString( tableContextErrors ) ) {
		errorMessageString += tableContextErrors;
		valid = false;
	}
	
	
	// Display the validation error messages in an alert for the user	
	if ( !valid ) {
		jAlert( errorMessageString );
	}
	
	// Remove the overlay screen (if any) if the query is invalid
	if ( !valid ) removeOverlayScreen();
	
	return valid;
}

/**
 * Clear the Reports section
 */
function clearReportsSection(){
	var confirmMsg = getClearReportsSectionWarningMessage();
	jConfirm(confirmMsg,"Confirmation",function(r){
		if ( r ) {
			var tableContainerDivId = 'table_container';
			
			overlayScreen('Clearing selections...');
			simulatedSleep(1000);
			
			// reset global variables
			resetGlobalVariables();
			
			// reset join contexts
			resetJoinContexts();
			
			// reset saved report template info, if applicable
			resetCurrentSavedReport();
			
			// reset search results, if applicable
			clearTableSearch();
			
			if ( !isCreateReportsPage() ) navigateToCreateReports();
				
			jQuery('input[id^=check_]:checked').each(function(){
				jQuery(this).attr('checked',false);
				invokeAttachedDOMEvent(jQuery(this),function(){removeOverlayScreen();});
			});
		}
	});
}

/**
 * Resets the state of the application, including clearing any selections and global variables as appropriate
 */
function resetApp(){
	// reset global variables
	resetGlobalVariables();
	
	// reset join contexts
	resetJoinContexts();
	
	// reset saved report template info, if applicable
	resetCurrentSavedReport();
	
	// reset search results, if applicable
	clearTableSearch();
	
	// deselected all selected questions
	jQuery('input[id^=check_]:checked').each(function(){
		jQuery(this).attr('checked',false);
		invokeAttachedDOMEvent(jQuery(this),function(){removeOverlayScreen();});
	});
}

/**
 * Constructs the warning message displayed to the user upon clicking the CLEAR button
 */
function getClearReportsSectionWarningMessage() {
	return "Are you sure you want to clear the current query?";
}

/**
 * Generate the Reports section
 */
function generateReportsSection(){
	// validate the query criteria supplied by the user
	var isValid = validateQueryCriteria();
	if ( isValid ) {
		// if the query criteria is valid then show the appropriate section
		navigateToViewReports();
	}
	return isValid;
}

function generateAnalytics(){
	// generate the Query object for the "Other"-related join context variables, if any
	if ( hasOtherJoinContextSelected() ) {
		getReportsForOtherJoinContextVariables();
	}
	// else, generate the Query object for the base variables
	else {
		getReportsForBaseVariables();
	}
}

function getReportsForOtherJoinContextVariables(response){
	if ( response ) { // the response object is the actual response object returned by a Query
		if (response.isError()) {
			jAlert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
			return;
	    }
		otherContextJoinVarResultSetArray.push( response.getDataTable() );
	}
	
	if ( otherContextJoinVarResultSetArray.length < 1 ) { // currently does not allow more than 1 "Other"-related join variable
		// process the "Other"-related join variable
		var otherJoinVar = getOtherRelatedJoinVariable();
		var otherJoinVarColumnName = getFormattedColumnName( otherJoinVar );
		var otherJoinVarQueryString = baseUrlString + 'caHopeDS?viewName=GetAllQuestionsWithAllAnswersAndOwners&group=true&orderedColumnNames=QId,' + otherJoinVarColumnName +',Owner,FormTableRow,ModuleId,FormId';
		otherJoinVarQueryString += '&startkey=["' + otherJoinVar + '"]&endkey=["' + otherJoinVar + ',{}"]';
		// if the base variable(s) are dates then indicate this in the request parameters
		otherJoinVarQueryString += hasDateDataType(otherJoinVar) ? '&dateDataType='+otherJoinVarColumnName : '';
		var otherJoinVarQuery = new google.visualization.Query(otherJoinVarQueryString);
		var querySelectStatement = 
			'select ' + otherJoinVarColumnName + ',FormTableRow,Owner,ModuleId,FormId' +
			getGoogleWhereClause( otherJoinVar );
		otherJoinVarQuery.setQuery(querySelectStatement);
		otherJoinVarQuery.send(getReportsForOtherJoinContextVariables);	
	}
	
	else {
		// derive a version of "otherContextJoinVarResultSet" without duplicates
		var googleJoinKey = buildGoogleJoinKey(getJoinKeyForOtherRelatedJoinVariable());
		var keys = new Array();		
		for ( var i = 0; i < googleJoinKey.length; ++i ) keys.push( googleJoinKey[i][0] );
		otherContextJoinVarResultSet = removeDuplicatesFromDataTable( otherContextJoinVarResultSetArray[ 0 ], keys );		
		
		//The following commented-out code may be useful to view the baseVarResultSet during debugging:
//		var reportTable = new google.visualization.Table($("reports_div_1"));
//		reportTable.draw(otherContextJoinVarResultSet,{showRowNumber:false,cssClassNames:{hoverTableRow:'noBackground',selectedTableRow:'noBackground',headerRow:'reportsTableHeader', headerCell:'reportsTableHeaderCell'}});
//		hideSpinner('reports_container_spinner');
//		$('reports_div_1').show();
		
		// generate the Query object for the base variables
		getReportsForBaseVariables();
	}	
}

/**
 * Generates resultset for the independent/filter variables ("baseVarResultSet").
 * 
 * NOTE: ENHANCEMENT FOR FORMTABLES (1/19/2012)
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Since we allow a mix of table and non-table independent/filter variables,
 * we will be executing joins where the join key does not include the "FormTableRow".
 * Yet we still need to include "FormTableRow" as one of the first columns in the resultset.
 * However, limitations in the Google API will not allow you to have any columns before the join key columns in the resultset.
 * Hence, this method includes some FormTable-related manipulations that were made to workaround this.
 * 
 */		  
function getReportsForBaseVariables(response) {
	if ( response ) { // the response object is the actual response object returned by a Query
	    if (response.isError()) {
		  jAlert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
		  return;
	    }	    
	    baseVarResultSetArray.push( response.getDataTable() );
	}
	
	if ( baseVarResultSetArray.length != baseVarArray.length ) {
		// This means that the base variables have not been completely processed,
		// so proceed to process the next batch of base variables
		var currBaseVar = baseVarArray[ baseVarResultSetArray.length ];	
		baseVarColumnNames.push( getFormattedColumnName( currBaseVar ) );
		
		// If the current variable is an autogenerated field, then skip to the next variable since query results will not be needed for autogenerated fields
		// (this should provide a slight performance boost)
		if ( isAutogeneratedField( currBaseVar ) ) {
			baseVarResultSetArray.push( null );
			getReportsForBaseVariables();
		}
		
		// else, proceed to run the query
		else {
			var baseVarColumnName = baseVarColumnNames[ baseVarColumnNames.length - 1 ];
			var otherJoinColumnName = getJoinColumnName( getOtherRelatedJoinVariable() );
			var baseVarQueryString = baseUrlString + 'caHopeDS?viewName=GetAllQuestionsWithAllAnswersAndOwners&group=true&orderedColumnNames=QId,' + baseVarColumnName +',Owner,FormTableRow,ModuleId,FormId';
			// if an "Other" join context exists then add the column to the query
			if ( otherJoinColumnName ) baseVarQueryString += ',' + otherJoinColumnName;
			baseVarQueryString += '&startkey=["' + currBaseVar + '"]&endkey=["' + currBaseVar + ',{}"]';
			// if the base variable(s) are dates then indicate this in the request parameters
			baseVarQueryString += hasDateDataType(currBaseVar) ? '&dateDataType='+baseVarColumnName : '';
			var baseVarQuery = new google.visualization.Query(baseVarQueryString);
			var hasOnlyBaseVariables = ( baseVarArray.length > 0 && dependentVarArray.length == 0 );
			var querySelectStatement = 
				'select ' + (otherJoinColumnName ? otherJoinColumnName+',' : '') + 'FormTableRow,Owner,ModuleId,FormId,' + baseVarColumnName +
				getGoogleWhereClause( currBaseVar );
			baseVarQuery.setQuery(querySelectStatement);
			baseVarQuery.send(getReportsForBaseVariables);
		}
	}
	
	else {
	    // This means that all the base variables have been processed,
		// so generate the baseVarResultSet entity by
		// performing an outer join of all the base variables
		for ( var index=0; index<baseVarResultSetArray.length; ++index) {
			var oldBaseVarSetIndices = new Array();
			var newBaseVarSetIndices = new Array();
			var oldQId = baseVarArray[ index - 1 ];
		    var newQId = baseVarArray[ index ];
		    // If the current questionId is autogenerated then simply duplicate its corresponding column in the resultset
		    if ( isAutogeneratedField( newQId ) ) {
		    	var autogeneratedFieldIndex = getColumnIndex( getAutogeneratedQuestionFieldMatchingJoinColumn( newQId ) );
		    	var autogeneratedFieldLabel = getQuestionShortName( newQId );
		    	addDuplicateColumn( baseVarResultSet, autogeneratedFieldIndex, autogeneratedFieldLabel );
		    }
		    else {
			    var joinContextSource = (oldQId ? findJoinContextSource( oldQId, newQId ) : newQId);
				var joinKey = getJoinKeyForQuestion( joinContextSource );
				var googleJoinKey = buildGoogleJoinKey( joinKey );
				if ( allJoinColumns.length == 0 ) allJoinColumns = getAllJoinColumns();
				if ( baseVarResultSet ) {
					var startingIndex = allJoinColumns.length;
					for ( var i = startingIndex; i < baseVarResultSet.getNumberOfColumns(); ++i) { // make the starting index = googleJoinKey[ googleJoinKey.length - 1 ][ 0 ] + 1 to exclude the joinkey-related columns
						oldBaseVarSetIndices.push( i );
					}
					for ( var i = allJoinColumns.length; i < baseVarResultSetArray[ index ].getNumberOfColumns(); ++i) { // make starting index = allJoinColumns.length to exclude the join key columns (OwnerId, ModuleId, FormId, etc.)
						newBaseVarSetIndices.push( i );
					}
				}
				if ( index==0 ) {
					baseVarResultSet = baseVarResultSetArray[ index ];
				}
				else {
					// Add any missing columns
					addMissingColumnsForJoin( oldBaseVarSetIndices, newBaseVarSetIndices, oldQId, newQId, googleJoinKey );
					
					baseVarResultSet  = 
						cacure.join(
								preprocessDataTable( baseVarResultSet, joinContextSource ),
								preprocessDataTable( baseVarResultSetArray[ index ], joinContextSource ),
								getJoinMethodForBaseVariables( joinContextSource ),
								googleJoinKey,
								oldBaseVarSetIndices,
								newBaseVarSetIndices);
				}
		    }
		}		
			    
	    // next, proceed to generate the final resultset to be displayed
		
		//The following commented-out code may be useful to view the baseVarResultSet during debugging:
//		var reportTable = new google.visualization.Table($("reports_div_1"));
//		reportTable.draw(baseVarResultSet,{showRowNumber:false,cssClassNames:{hoverTableRow:'noBackground',selectedTableRow:'noBackground',headerRow:'reportsTableHeader', headerCell:'reportsTableHeaderCell'}});
//		hideSpinner('reports_container_spinner');
//		$('reports_div_1').show();
		
	    if ( dependentVarArray.length == 0 ) { // no dependent variables exist        
	        generateCombinedResultSet(1);
	    }
	    else {
	    	// Else, generate the dependent variable resultset
	    	getReportsForDependentVariables();  	
	    }
	}	
}
/**
 * Generates resultset for the dependent variables ("dependentVarResultSet").
 * 
 * NOTE: ENHANCEMENT FOR FORMTABLES (1/19/2012)
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Unlike when executing the join for "baseVarResultSet" and "joinedResultSet" datatables,
 * we do not perform any FormTable-related processing for dependent variables
 * since we are not allowing a mix of table and non-table dependent variables
 * (it is all-or-none: either all of them will be table-related, or none of them will be table-related).
 * 
 */		
function getReportsForDependentVariables(response) {
	if ( response ) { // the response object is the actual response object returned by a Query
	    if (response.isError()) {
		  jAlert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
		  return;
	    }	    
	    dependentVarResultSetArray.push( response.getDataTable() );
	}
	
	if ( dependentVarResultSetArray.length != getNumDependentVariableQuestions() ) {
		// This means that the dependent variables have not been completely processed,
		// so proceed to process the next batch of dependent variables
		var qId = dependentVarArray[ dependentVarResultSetArray.length ][0];
		var dependentVarColumnName = getFormattedColumnName( qId );
		var otherJoinColumnName = getJoinColumnName( getOtherRelatedJoinVariable() );
		// For now, retrieve the resultset for the complete set of answers for the dependent variable
    	// (irrespective of specified answers)
		var dependentVarQueryString = baseUrlString + 'caHopeDS?viewName=GetAllQuestionsWithAllAnswersAndOwners&group=true&orderedColumnNames=QId,' + dependentVarColumnName +',Owner,FormTableRow,ModuleId,FormId';
		// if an "Other" join context exists then add the column to the query
		if ( otherJoinColumnName ) dependentVarQueryString += ',' + otherJoinColumnName;
		// if the dependent variable(s) are numeric then indicate this in the request parameters
		dependentVarQueryString += hasNumericDataType(qId) ? '&numericDataType='+dependentVarColumnName : '';
		// if the dependent variable(s) are dates then indicate this in the request parameters
		dependentVarQueryString += hasDateDataType(qId) ? '&dateDataType='+dependentVarColumnName : '';
		dependentVarQueryString += '&startkey=["' + qId + '"]&endkey=["' + qId + ',{}"]';
		var dependentVarQuery = new google.visualization.Query(dependentVarQueryString);
		var selectString;
		if( hasNumericDataType(qId) )
		{
			selectString = 'select ' + (otherJoinColumnName ? otherJoinColumnName+',' : '') +
                'FormTableRow,Owner,ModuleId,FormId,' + getSelectedAggregation(qId) + '(' + dependentVarColumnName + ')' + 
                getGoogleWhereClause( qId ) + ' group by ' + (otherJoinColumnName ? otherJoinColumnName+',' : '') + 'FormTableRow,Owner,ModuleId,FormId' ;
		}
        
		else
		{
			selectString = 'select ' + (otherJoinColumnName ? otherJoinColumnName+',' : '') + 
			'FormTableRow,Owner,ModuleId,FormId,count(QId)' +
			getGoogleWhereClause( qId ) + ' group by ' + (otherJoinColumnName ? otherJoinColumnName+',' : '') + 'FormTableRow,Owner,ModuleId,FormId pivot '+ dependentVarColumnName;
		}
		dependentVarQuery.setQuery( selectString );
		dependentVarQuery.send(getReportsForDependentVariables);
	}
	
	else {
	    // This means that all the dependent variables have been processed,
		// so generate the dependentVarResultSet entity by
		// performing an outer join of all the dependent variables
		for ( var index=0; index<dependentVarResultSetArray.length; ++index) {
			var oldDependentVarSetIndices = new Array();
			var newDependentVarSetIndices = new Array();
			var qId = dependentVarArray[ index ][ 0 ] ;
			var joinKey = getJoinKeyForQuestion( qId );
			if ( allJoinColumns.length == 0 ) allJoinColumns = getAllJoinColumns();
			if ( dependentVarResultSet ) {
				for ( var i = joinKey.length; i < dependentVarResultSet.getNumberOfColumns(); ++i) { // make starting index = joinKey.length to exclude those columns
					oldDependentVarSetIndices.push( i );
				}
				for ( var i = allJoinColumns.length; i < dependentVarResultSetArray[ index ].getNumberOfColumns(); ++i) { // make starting index = allJoinColumns.length to exclude those columns (OwnerId, ModuleId, FormId, etc.)
					newDependentVarSetIndices.push( i );
				}
			}
			if ( index==0 ) {
				dependentVarResultSet = dependentVarResultSetArray[ index ];
			}
			else {
				dependentVarResultSet  = 
					cacure.join(
							dependentVarResultSet,
							dependentVarResultSetArray[ index ],
							'full',
							buildGoogleJoinKey( joinKey ),
							oldDependentVarSetIndices,
							newDependentVarSetIndices );				
			}
		} 
		
		generateCombinedResultSet(1);
		
	    //The following commented-out code may be useful to view the dependentVarResultSet during debugging:
//		var reportTable = new google.visualization.Table($("reports_div_1"));
//		reportTable.draw(dependentVarResultSet,{showRowNumber:false,cssClassNames:{hoverTableRow:'noBackground',selectedTableRow:'noBackground',headerRow:'reportsTableHeader', headerCell:'reportsTableHeaderCell'}});
//		hideSpinner('reports_container_spinner');
//		$('reports_div_1').show();
    
	}  
}

// Exports data in downloadable image format
function generateChartAsImage(reportType){
	generateCombinedResultSet( reportType + 5 );
}

// Exports data in Excel format
function generateExcel(){
	var tableElm = jQuery('.google-visualization-table-table')[0];
	if ( tableElm ) {
		var tableText = "<table>" + tableElm.innerHTML + "</table>"; 
		jQuery.download(baseUrlString  + 'ExcelExportServlet',{htmlTable:encodeURIComponent(tableText)});
	}
}

/**
 * Generates the final resultsets and prepares other app components needed to draw the visualizations.
 * It generates the results of joining the datatable for the independent/filter variables 
 * with the datatable for dependent variables ("joinedResultSet"),
 * from grouping "joinedResultSet" by the appropriate independent/filter variables ("groupedResultSet"),
 * and from setting up the "groupedResultSet" so it could be properly displayed for the visualizations.
 * 
 * NOTE: ENHANCEMENT FOR FORMTABLES (1/19/2012)
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Since we allow a mix of table and non-table independent/filter variables/dependent variables,
 * we will be executing joins where the join key does not include the "FormTableRow".
 * Yet we still need to include "FormTableRow" as one of the first columns in the resultset.
 * However, limitations in the Google API will not allow you to have any columns before the join key columns in the resultset.
 * Hence, this method includes some FormTable-related manipulations that were made to workaround this.
 * 
 */	
function generateCombinedResultSet(reportType){	 
	// remove any overlay
	removeOverlayScreen();
	
	// update the value of the current report type
	currentReportType = reportType;
	// update menu tabs as appropriate
	setAsCurrentMenuTab('reportType_' + reportType);	
	var hasDependentVariables = ( dependentVarResultSet != null );
	var hasMultipleBaseVariables = ( baseVarArray.length > 1 );
	
	var firstIndependentVar = baseVarArray[ 0 ];
    var firstDependentVar   = getNumDependentVariableQuestions() > 0 ? dependentVarArray[ 0 ][ 0 ] : null;
    var joinContextSource   = findJoinContextSource( firstDependentVar, firstIndependentVar );
	var joinKey = getJoinKeyForQuestion( joinContextSource ); 
	var googleJoinKey = buildGoogleJoinKey( joinKey );
	if ( allJoinColumns.length == 0 ) allJoinColumns = getAllJoinColumns();
	
	// initialize the groupedResultSet if it's null
	if ( groupedResultSet == null ){
		if ( hasDependentVariables ) {
			// construct an array containing the column indices from dependentVarSet
			// to include in the resultSet representing the join
			var dependentVarReportColumns = new Array();
			for ( var i = allJoinColumns.length; i < dependentVarResultSet.getNumberOfColumns(); ++i ) { // make starting index = allJoinColumns.length to exclude the join key columns (OwnerId, ModuleId, FormId, etc.)
				for ( var j = 0; j < dependentVarArray.length; ++j ) {
					if ( dependentVarResultSet.getColumnLabel(i).indexOf(dependentVarArray[j][1]) == 0 ||
						 dependentVarArray[j][1] == null ) {
						 if ( dependentVarReportColumns.indexOf(i) == -1 ) dependentVarReportColumns.push( i );
						 break;
					}
				}
			}
			
			// construct an array containing the column indices from baseVarSet
			// to include in the resultSet representing the join
			var baseVarReportColumns = new Array();
			var startingIndex = allJoinColumns.length;
			for ( var i = startingIndex; i < baseVarResultSet.getNumberOfColumns(); ++i ) { // make starting index  = googleJoinKey[ googleJoinKey.length - 1 ][ 0 ] + 1 to exclude the joinkey-related columns
				baseVarReportColumns.push( i );
			}
//			// Add any missing columns
			addMissingColumnsForJoin( baseVarReportColumns, dependentVarReportColumns, firstIndependentVar, firstDependentVar, googleJoinKey );
			
			// Perform a join between the base variable resultset and
			// the dependent variable result set
			joinedResultSet = cacure.join(
					preprocessDataTable( baseVarResultSet, joinContextSource ),
					preprocessDataTable( dependentVarResultSet, joinContextSource ),
					getJoinMethodForJoinedResultSet( joinContextSource ),
					googleJoinKey,
					baseVarReportColumns,
					dependentVarReportColumns);
			
		}
		else { // no dependent variables exist; so no join needs to be performed
			joinedResultSet = baseVarResultSet;
		}
		
		// Next, update the autogenerated columns as appropriate
		synchronizeAutogeneratedColumns(joinedResultSet);
		
		//The following commented-out code may be useful to view the resultSet during debugging:
//		var reportTable = new google.visualization.Table($("reports_div_1"));
//		reportTable.draw(joinedResultSet,{showRowNumber:false,cssClassNames:{hoverTableRow:'noBackground',selectedTableRow:'noBackground',headerRow:'reportsTableHeader', headerCell:'reportsTableHeaderCell'}});
//		hideSpinner('reports_container_spinner');
//		$('reports_div_1').show();
			
		// Next, perform a GROUP BY on the data
		var aggregationColumns = new Array();
		// if there are no dependent variables, then we add a new column to the dataset that will represent the aggregation column
		var numGroupingColumns = hasDependentVariables ? joinedResultSet.getNumberOfColumns() : joinedResultSet.getNumberOfColumns() + 1;
		var keyColumns = new Array();
		var currDependentQIndex = -1;
		var numColumnsForDependentQId = 0;
		for ( var i = allJoinColumns.length ; i < numGroupingColumns; ++ i ) { // make starting index = allJoinColumns.length to exclude the join key columns (OwnerId, FormTableRow, ModuleId, FormId, etc.)
			if ( i < baseVarArray.length + allJoinColumns.length ){
					keyColumns.push( {column: i, modifier: getEmptyCellValue, type: joinedResultSet.getColumnType(i), label: joinedResultSet.getColumnLabel( i )} );
			}
			else
			{
				// EXPLANATION of nextDependentQuestionIndex:
				// i corresponds to
				// the number of base variables, 
				// + the loop's current index in the list of dependent variables.
				// The current index of dependent variables, in turn, 
				// corresponds to the number of columns for each dependent question Id
				// (since each dependent question can have multiple columns represented - 
				// every possible answer has its own column for non-numeric questions.)
				// Hence, if we have not yet finished iterating through
				// all the columns for a dependent question, there is no need to move on to the next
				// dependent question.
				// Else, we increment currDependentQIndex because we are now ready to 
				// start processing columns for the next dependent question.
				// (NOTE: Here we add allJoinColumns.length to nextDependentQuestionIndex because additional columns - Owner,ModuleId,FormId... - exist in the dataset.)
				if ( hasDependentVariables ) {
					var nextDependentQuestionIndex = baseVarArray.length + numColumnsForDependentQId + allJoinColumns.length;
					if ( i >= nextDependentQuestionIndex ) {
						++currDependentQIndex;
						numColumnsForDependentQId += getNumColumnsForDependentQuestion(dependentVarArray[currDependentQIndex][0]);
					}
					aggregationColumns.push({'column': i, 'aggregation': getAggregationMethodObject( dependentVarArray[ currDependentQIndex ][0] ), 'type': 'number', label: joinedResultSet.getColumnLabel( i )});
				}
				
				else {			
					aggregationColumns.push({'column': 0, 'aggregation': cacure.countNonNull, 'type': 'number', label: 'Count'});
				}
			}
		}
		
		groupedResultSet = google.visualization.data.group(
			joinedResultSet,
			keyColumns,
			aggregationColumns
		);
		
		//The following commented-out code may be useful to view the baseVarResultSet during debugging:
//		var reportTable = new google.visualization.Table($("reports_div_1"));
//		reportTable.draw(groupedResultSet,{showRowNumber:false,cssClassNames:{hoverTableRow:'noBackground',selectedTableRow:'noBackground',headerRow:'reportsTableHeader', headerCell:'reportsTableHeaderCell'}});
//		hideSpinner('reports_container_spinner');
//		$('reports_div_1').show();
	}
	
	// Next, add custom formatting to the columns in "groupedResultSet" as appropriate
	formatReportDataWithCustomFormatting( groupedResultSet );
			
	// Next, set up the visualizations which will display the results of the GROUP BY operation
	if ( !reportVisualizations )
	{
		reportVisualizations = getVisualizationHash();
				
		// The charts should use a derived DataView of groupedResultSet, when appropriate.
		// Override the "draw" method of the chart visualizations 
		// so that they always use the derived DataView as the dataset when appropriate;
		// also, they should alert the user if the dataset does not fit the visualization.
		overrideDrawMethod();
	}
	
	// set up the current visualization's configuration options
	setUpReportOptions(null,reportType);
	
	// hide the spinner
	hideSpinner('reports_container_spinner');
	
	// Next, determine whether or not the query returned any results, as
	// an empty resultset will cause the filter control to break:
	
	
	// If there are no rows in groupedResultSet, then 
	// indicate that there is no data in the resultset
	var noDataFound = ( groupedResultSet.getNumberOfRows() == 0 );
	if ( noDataFound ) 
	{
		var msg ='<b>No data was found.</b><br/><br/>'
			msg+='<b>EXPLANATION:</b><br/><ul><li>There might not be any data available for the independent variable(s) you selected.</li>';
		    msg+=getMostRestrictiveJoinContextForCurrentQuery() == 'default' ? 
		    	 '</li></ul>' : 
		    	 '<li>The <b>Group By</b> selections might be too restrictive. Try making them less restrictive, for example: change <b><i>Module</i></b> selections to <b><i>Default</i></b>, or <b><i>Form</i></b> selections to <b><i>Module</i></b> or <b><i>Default</i></b>. </li></ul>';
		jAlert(msg,"NO DATA");
		
		// clear any existing overlay
		removeOverlayScreen();
		
		//return
		return;
	}
	else
	{
		// set up controls to display in addition to the report/chart
		setUpControls( reportType, groupedResultSet, reportConfigOptions );
	
		// open up a dialog box for ImageCharts
		if ( isImageChartType( reportType ) ) {	
			showDialogBox( 'reportimages_div_' + reportType );
		}
	}
}

// function which determines whether or not a given data set can be filtered
// with the Systems-Biology filter currently being used in the application
function canBeFiltered( data ) {
	return ( data.getNumberOfRows() > 1 );
}

// Returns a hash of visualization types
function getVisualizationHash(){
	var oHash = new Object();
	if ( ! primaryVisualizations ) primaryVisualizations = setUpPrimaryVisualizations();
	if ( ! secondaryVisualizations ) secondaryVisualizations = setUpSecondaryVisualizations();
	// add primary visualizations to the hash
	for ( var i in primaryVisualizations ) { oHash[i] = primaryVisualizations[i]; }
	// add secondary visualizations to the hash
	for ( var i in secondaryVisualizations ) { oHash[i] = secondaryVisualizations[i]; }
	// set up error messages associated with each visualization
	if ( !visualizationMismatchErrors ) visualizationMismatchErrors = setUpVisualizationMismatchErrors();
	return oHash;
}

// returns a hash of PRIMARY visualizations
function setUpPrimaryVisualizations(){
	var hsh = {
	 1: new google.visualization.BarChart($("reports_div_1")),//bar chart
	 2: new google.visualization.AreaChart($("reports_div_2")), //area chart
	 3: new google.visualization.PieChart($("reports_div_3")),//pie chart
	 4: new google.visualization.LineChart($("reports_div_4")),//line chart
	 5: new google.visualization.Table($("reports_div_5")),//table
	 6: new google.visualization.ImageBarChart($("reportimages_div_6")),//image bar chart
	 7: new google.visualization.ImageAreaChart($("reportimages_div_7")), //image area chart
	 8: new google.visualization.ImagePieChart($("reportimages_div_8")),//image pie chart
	 9: new google.visualization.ImageLineChart($("reportimages_div_9"))//image line chart
	};
	return hsh;
}

//returns a hash of SECONDARY visualizations
// NOTE: Overridden in proprietary code.
function setUpSecondaryVisualizations(){	
	return {};
}

// returns a hash of mismatch errors associated with the visualizations
// NOTE: Overridden in proprietary code.
function setUpVisualizationMismatchErrors(){
	return {};
}


//returns an array of potential mismatch errors associated
//with the visualization that is associated with this report type
function getVisualizationMismatchErrorForReportType(reportType){
	if ( !visualizationMismatchErrors ) visualizationMismatchErrors = setUpVisualizationMismatchErrors();
	return visualizationMismatchErrors[reportType.toString()];
}

//Utility method for re-drawing visualizations.
//Currently invoked when one of the report option controls are selected.
function redraw( reportType, opts ) {
	setUpReportOptions( opts, reportType );
	filterControl.applyFilter();
}

// Utility method for generating report options
function setUpReportOptions( opts, reportType ){
	reportConfigOptions = {
		    title: getDependentVarAxisTitle().toUpperCase()+' based on '+getIndependentVarAxisTitle().toUpperCase(),
			showRowNumber: false,
			titleY: ( reportType && reportType.toString() == '1' ? getIndependentVarAxisTitle() : getDependentVarAxisTitle()),
			titleX: ( reportType && reportType.toString() == '1' ? getDependentVarAxisTitle() : getIndependentVarAxisTitle()),
			legendTextColor: '#665257',
			isStacked: ( opts && opts['isStacked'] ) ? opts['isStacked']=='stacked' : true,
			legendFontSize: 11,
			axisFontSize: 11,
			titleFontSize: 11,
			cssClassNames: {hoverTableRow:'noBackground',selectedTableRow:'noBackground',headerRow:'reportsTableHeader2', headerCell:'reportsTableHeaderCell2'},
			width: 780,
			height: (reportType ? getCurrentChartHeight(reportType) : 440)
	};	
}

// Utililty Methods for setting up report controls
function setUpControls( reportType, resultSet, opts ) {
	// Set up filter control
	setUpFilterControl( reportType, resultSet, opts );
			
	// Set up report controls, as applicable
	setUpReportControls( reportType );	
}

function setUpFilterControl( reportType, resultSet, opts ) {
	// un-hide the targeted visualization as appropriate
	if ( ! isImageChartType( reportType ) ) {
		jQuery("div[id^=reports_div_]").hide();
		jQuery("#reports_div_"+reportType).show();
	}	

	//set up the visualizations array parameter
	var arr = new Array();
	for ( var prop in reportVisualizations )
	{
		var currOpts = {};
		for ( key in opts )
		{
			currOpts[ key ] = opts[ key ];
		}
		arr.push( { visualization: reportVisualizations[prop], options: currOpts } );			
	}	
	
	// If the current data set can NOT be filtered, then draw the visualizations without using the filter
	if ( ! canBeFiltered( resultSet ))
	{
		for ( var index = 0; index < arr.length; ++index )
		{
			var oVisualization = arr[index]['visualization'];
			oVisualization.draw( resultSet, arr[index]['options'] );
		}
	}	
	// else, handle the filtering
	else
	{
		if ( ! filterControl ) {
			$("filter_container").empty();
			filterControl = new org.systemsbiology.visualization.FilterDataTableControl($("filter_container"));
			
			//set up the visualizations array parameter
			var arr = new Array();
			for ( var prop in reportVisualizations )
			{
				var currOpts = {};
				for ( key in opts )
				{
					currOpts[ key ] = opts[ key ];
				}
				arr.push( { visualization: reportVisualizations[prop], options: currOpts } );			
			}	
			filterControl.controlled = new Array();
			
			// draw the filter control and its associated visualizations
			filterControl.draw( resultSet, 
				           { controlledVisualizations: arr,
			              // hideFilterContainerOnOpen : true,
				  columnIndexesToFilter : getFilterableColumns(resultSet),
			              labelForTitle : 'Filter Results...'});
		}else {
			filterControl.applyFilter();
		}
	}
}

// Returns an array of columns that can be included in the filter control:
// 1. Currently, columns that do not have more than 1 unique value will cause the 
// filter control to break, so those columns must be removed from the set
// of filterable columns.
function getFilterableColumns( data ) {
	var cols = new Array();
	for ( var i = 0; i < data.getNumberOfColumns(); ++i ) {
		var columnRange = data.getColumnRange(i);
		if ( columnRange && columnRange['min'] != columnRange['max'] ) {
			cols.push( i );
		}
	}
	return cols;
}

function setUpReportControls( reportType ){
	if ( ! isImageChartType( reportType ) ) {
		jQuery("#report_controls").empty();
		
	    jQuery("#report_controls").addClass('report_controls');
	    
	    // Add the "Save Query" link which will be used to save search queries as templates
		jQuery('#report_controls').prepend("<span><a href=\"#reportresults\" class=\"saveQueryLink\" onclick=\"saveReportQuery()\">Save Query...</a></span>");
	    
		// Add the "Filter" link which will be used to filter reports
		jQuery('#report_controls').prepend("<span><a href=\"#reportresults\" class=\"showFilterLink\" onclick=\"showFilterControlDialog()\">Filter...</a></span>");
		  
		// Set up Report option controls:
		// Add a "Chart Type" dropdown for Bar charts
		if ( reportType == 1 ) {
			jQuery('#report_controls').prepend("<span id=\"reportOptionalControls\">Bar Display: <select onchange=\"redraw(" + reportType + ",{isStacked:this.value})\"><option value=\"stacked\">Stacked</option><option value=\"grouped\">Grouped</option></select></span>");
		}
		
	    // Set up Export Links:
		// Add an "Export As Image" link for non-Tabular charts
		if ( reportType != 5 && reportType != 10 ) {
			jQuery('#report_controls').prepend("<span><a href=\"#reportresults\" onclick=\"generateChartAsImage("+reportType+")\">Export...</a></span>");
		}	
		// Add an "Export as Excel" link for Tabular reports
		if ( reportType == 5 || reportType == 10 ) {
			jQuery('#report_controls').prepend("<span><a href=\"#reportresults\" onclick=\"generateExcel()\">Export...</a></span>");
		}
	}
}

function showDialogBox( divId, dlgBoxTitle ) {
	if ( !dlgBoxTitle ) dlgBoxTitle = 'EXPORT';
	var htmlString = jQuery('#'+divId).html();
	htmlString += "<div><input type=\"button\" class=\"reportImageDlgBtn\" value=\"Close\" onclick=\"Modalbox.hide()\"/></div>";
	Modalbox.show(htmlString,{title: dlgBoxTitle, width: 800, height: 400});
}

function showFilterControlDialog(){
	if ( !canBeFiltered( groupedResultSet ) ) // The filter widget does not support filtering for result sets with only 1 row
	{
		jAlert("<font color=\"red\">Sorry, cannot filter data sets with only 1 row.</font>","CANNOT FILTER DATA");
	}
	else
	{
		jQuery('#filter_container_wrapper').fadeIn(500);
		filterControl.toggleContainerOpen();
	}
}


// END utility methods for report controls

/* Utility Methods for updating the resultsets with appropriate information
 *    based on the data type(s)
 */

function hasNumericDataType( qId ) {
	var questionDataType = jQuery('#seldata_'+qId).val();
	return questionDataType == 'number';
}

function hasDateDataType( qId ) {
	var questionDataType = jQuery('#seldata_'+qId).val();
	return questionDataType == 'date';
}
// END utility Methods for updating the resultsets based on datatype(s)

/* Google API Enhancements */

// Overrides the draw method by explicitly binding it to a new DataView
function overrideDrawMethod(){
	for ( var type in reportVisualizations ) {
		var visualization = reportVisualizations[ type ];
		if ( ! visualization['draw_old'] ) {			
			visualization['draw_old'] = visualization['draw'];
			visualization['report_type'] = type;
			visualization['draw'] = function(){

				// Remove any overlay
				removeOverlayScreen();
				
				// Reset the flag indicating whether a saved report was loaded
				wasSavedReportLoaded = false;
				
				if ( currentReportType == this.report_type ){ // only draw the visualizations if it was selected
					var base_dt = resetColumnsForDisplay(this.report_type,arguments[0]);
					var dt = resetColumnsForVisualization(this.report_type,arguments[0],base_dt);
					if ( dt ) {
						this.draw_old(dt,reportConfigOptions);
					}
					else {
						// we assume that "dt" is null because there was a data type mismatch
						// between the data in the datatable and the requested visualization.
						var alertMsg = "<b><i>Sorry, this visualization cannot be used to view this type of data.</i></b>";
						alertMsg += "<br/>Would you like to try transforming the data?";
						var oVisualization = this;
						var oOptions = reportConfigOptions;
						var oConfirmationFunction = function(confirmed){
							if ( confirmed ) {
								dt = transformDataForVisualization(oVisualization.report_type,base_dt);
								if ( dt ) oVisualization.draw_old(dt,oOptions);
								else {
									var msg = "<b><i>Sorry, could not convert the data.</i></b>";
									var errors = getVisualizationMismatchErrorForReportType(oVisualization.report_type);
									if ( errors ) {
										msg += "<br/><br/> Please check the following in your query:<br/>";
										for ( var i = 0; i < errors.length; ++i ) {
											msg += "<li>" + errors[i] + "</li>";
										}
									}
									jAlert(msg, "Could Not Display");
								}
							}
						};
						var alreadyDidTransformation = arrayContains( dataMismatchReportTypes, oVisualization.report_type.toString() );
						if ( alreadyDidTransformation ) {
							oConfirmationFunction(true);
						}
						else {
							jConfirm(alertMsg, "Data Mismatch", oConfirmationFunction);
							dataMismatchReportTypes.push(oVisualization.report_type.toString());
						}
					}
				}
			}
		}
	}
}

// preprocesses the DataTable returned in the response to a query
function preprocessDataTable( dataTable, qId ) {
	if ( getQuestionSelectedJoinContext( qId ) == 'other' ) {		
		var joinKey = getJoinKeyBetweenOtherRelatedJoinVariableAndQuestion( qId );
		var googleJoinKey = buildGoogleJoinKey( joinKey );
		
		// determine the first non-key column in the resultset
		var firstNonKeyColumnInDataTable = googleJoinKey[ googleJoinKey.length - 1 ][0] + 1;
					
		// determine the array of columns that will come AFTER the key columns in the resultset			
		var dataTableIndexes = fillArrayWithRange( firstNonKeyColumnInDataTable, dataTable.getNumberOfColumns()-1 );
							
		// perform the join
		var dt = cacure.join(
					otherContextJoinVarResultSet,
					dataTable,
					'inner',
					googleJoinKey,
					[ 0 ],
					dataTableIndexes);
		return dt;
	}
	else {
		// else, reset the "Other"-related join variable column
		// so that it has the same value - '1' - for each row
		if ( hasOtherJoinContextSelected() ){
			var columnLabel = dataTable.getColumnLabel( 0 );
			var columnId = dataTable.getColumnId( 0 );
			dataTable.removeColumn(0);
			dataTable.insertColumn(0,'string',columnLabel,columnId);
			for ( var i = 0; i < dataTable.getNumberOfRows(); ++i ) {
				dataTable.setCell( i, 0, '1' );
			}
		}
	}
	
	return dataTable;
}

// Sets up the DataView as appropriate in order to display it in a visualization
function resetColumnsForDisplay(reportType,data){
	var arr = new Array();
	var arr2 = new Array();
	var hasDependentVariables = ( dependentVarResultSet != null );	
	var hasFilterVariables = ( getNumFilterVariableQuestions() > 0 );
	var hasDependentOrFilterVariables = ( hasDependentVariables || hasFilterVariables );
	var oReportType = parseInt( reportType );
	var hasAnyColumnDataTransformations = areColumnDataTransformationsRequired(reportType,data);
	var hasSecondaryVisualization = isSecondaryVisualization(reportType);
	var view;
	var numColumnsForDependentQId=0;
	var currDependentQIndex = -1;
	
	//1. First, if no actual data transformations are required, and 
	// if oReportType = 5 (table)
	// or there are no dependent variables,
	// then the dataset should remain unchanged.
	if ( ! hasAnyColumnDataTransformations && ! hasSecondaryVisualization &&
		( oReportType == 5 || ! hasDependentOrFilterVariables )) {
		return data;
	}
	
	// Else,
	
	//2. Next, the dataset should be the result of grouping by the independent variable(s) only.
	// Hence, all filter variables should be removed from the dataset
	// EXCEPT if the current visualization is a table.
	arr = getNonGroupingColumnObjects(data,baseVarArray.length);
	var lastGroupingIndex = ( isTableType(oReportType) ? baseVarArray.length-1 : getNumIndependentVariableQuestions()-1 );
	var groupingArr = fillArrayWithRange(0,lastGroupingIndex);
	var newGroupedView = google.visualization.data.group( data, groupingArr, arr	);
	view = newGroupedView;
	
	//3. Next, transform the data if applicable	
	if ( hasAnyColumnDataTransformations ) {
		var qId=null;
		for ( var i = 0; i < view.getNumberOfColumns(); ++i ){ 
			if ( i <= lastGroupingIndex ){
				qId = baseVarArray[ i ];
			}
			else{
				var nextDependentQuestionIndex = ( lastGroupingIndex + 1 ) + numColumnsForDependentQId;
				if ( i >= nextDependentQuestionIndex ) {
					++currDependentQIndex;
					numColumnsForDependentQId += getNumColumnsForDependentQuestion(dependentVarArray[currDependentQIndex][0]);
				}
				qId = dependentVarArray[currDependentQIndex][0];
			}
			
			// get the transformed column object that should be associated with this question
			arr2.push(getTransformedColumnObject(qId,view,i));
		}
		// generate a new view with the newly transformed data		
		var newDateView = new google.visualization.DataView(view);
		newDateView.setColumns(arr2);
		var lastGroupingIndex = ( isTableType(oReportType) ? baseVarArray.length-1 : getNumIndependentVariableQuestions()-1 );
		var groupArr = fillArrayWithRange(0,lastGroupingIndex);
		var newGroupedView = google.visualization.data.group( newDateView, groupArr, getNonGroupingColumnObjects(newDateView,lastGroupingIndex+1) );
		//The following commented-out code may be useful to view the view during debugging:
		/*var reportTable = new google.visualization.Table($("reports_div_1"));
		reportTable.draw(view,{showRowNumber:false,cssClassNames:{hoverTableRow:'noBackground',selectedTableRow:'noBackground',headerRow:'reportsTableHeader', headerCell:'reportsTableHeaderCell'}});
		hideSpinner('reports_container_spinner');
	    $('reports_div_1').show();*/
		
		// reformat the data appropriately
		view = formatDataTableOrView(newGroupedView,arr2);
	}
	return view;
}

// Determine if any of the columns in the current resultset should undergo any data transformation.
function areColumnDataTransformationsRequired(reportType,data){
	// Date columns should be transformed to contain only date parts that are consistent with the selected date format 
	if (hasAnySelectedDataType('date')) return true;
	
	// ............any other conditions.............
	
	// Else, return false
	return false;
}

//Determine if any of the columns in the current query should undergo any custom data formatting.
function areColumnCustomDataFormattingsRequiredForQuery(){
	// 1. Custom formatting is required if any of the selected fields are autogenerated fields
	if (hasAnySelectedAutogeneratedFields()) return true;
	
	// 2. ........any other conditions............
	
	// Else, return false
	return false;
}

// Formats the provided data table/view using either:
// - custom; or
// - non-custom (Google API-based) formatting
function formatDataTableOrView(dataView,reformatColumns,useCustomFormat){
	if ( useCustomFormat ) {
		return formatReportDataWithCustomFormatting( dataView );
	}
	else {
		return formatReportDataWithNonCustomFormatting( dataView,reformatColumns );
	}
}

// Formats the data table/view with standard Google Data Formatters
function formatReportDataWithNonCustomFormatting( dataView,reformatColumns ){
	var dataTable = isFunctionInObject(dataView,'toDataTable') ? dataView.toDataTable() : dataView;
	
	for ( var i=0; i < reformatColumns.length; ++i ){
		var formatToUse = reformatColumns[i]['format'];
		if ( formatToUse ){			
			var visualizationFormatter;
			if ( reformatColumns[i]['type'] == 'date' ){
				visualizationFormatter = new google.visualization.DateFormat({pattern:formatToUse});
				visualizationFormatter.format(dataTable,i);
			}					
		}
	}	
	return new google.visualization.DataView(dataTable); 
}

// Formats the data table/view with custom Data Formatters (data formatters that do not come from the standard Google APIs)
function formatReportDataWithCustomFormatting(dataTable){	
	for ( var colIndex = 0; colIndex < dataTable.getNumberOfColumns(); ++colIndex ) {
		var shortName = dataTable.getColumnLabel( colIndex );
		
		formatColumn( dataTable, colIndex, shortName );
	}
	
	//return the dataTable
	return dataTable;
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// CUSTOM DATA FORMATS
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


function formatColumn( dataTable, colIndex, associatedQuestionShortName ) {
	
	// 1. Format autogenerated fields
	if( isAutogeneratedShortName( associatedQuestionShortName ) ) {
		formatAutogeneratedColumn( dataTable, colIndex, associatedQuestionShortName );
	} 
}

// Apply appropriate formatting to the specified autogenerated field 
function formatAutogeneratedColumn( dataTable, colIndex, associatedQuestionShortName ) {
	var hsh = { 'Form': 'forms', 'Module': 'modules' };
	var autoGenFieldMetaData = hsh[ associatedQuestionShortName ] ? appModuleMetadata[ hsh[ associatedQuestionShortName ] ] : null;
	if ( autoGenFieldMetaData ) {
		for ( var rowIndex = 0; rowIndex < dataTable.getNumberOfRows(); ++rowIndex ){
			var value = dataTable.getValue( rowIndex, colIndex );	
			var valueMetaData = autoGenFieldMetaData[ value ];
			if ( valueMetaData ) dataTable.setFormattedValue( rowIndex, colIndex, valueMetaData[ 'name' ] );
		}
	}
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// End CUSTOM DATA FORMATS
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Returns an array of Google Visualization column object for the non-grouping variables 
// (i.e. variables that are NOT independent variables)
function getNonGroupingColumnObjects(data,firstIndex){
	var numColumnsForDependentQId=0;
	var currDependentQIndex = -1;
	var hasDependentVariables = ( dependentVarResultSet != null );
	var arr = new Array();
	
	for ( var i = firstIndex; i < data.getNumberOfColumns(); ++i ) {
		if ( hasDependentVariables ) {
			var nextDependentQuestionIndex = firstIndex + numColumnsForDependentQId;
			if ( i >= nextDependentQuestionIndex ) {	
				++currDependentQIndex;
				numColumnsForDependentQId += getNumColumnsForDependentQuestion(dependentVarArray[currDependentQIndex][0]);
			}
			arr.push( { column: i, aggregation: getAggregationMethodObject( dependentVarArray[ currDependentQIndex ][0] ), type: 'number'} );
		}
		
		else {
			// TODO: Here we assume that the only possible aggregation
			// for reports that do not have dependent variables
			// is the "count" aggregation.			
			// In the future add other aggregation types as well
			// (for example, "max" aggregation for Dates)
			
			// an aggregation of separate counts requires the "sum" aggregation.
			arr.push( { column: i, aggregation: google.visualization.data.sum, type: 'number'} );
		}
	}
	
	return arr;
}

//This function adds any missing columns to the set of non-key columns that will be included in the results of a join.
//Currently the processing includes:
//1. Adding the Form, Module, FormTableRow column to the columns in the resultset if needed
function addMissingColumnsForJoin( leftColumns, rightColumns, leftQId, rightQId, googleJoinKey ){
	var useLeft, columns;
	var joinKeyIndexes = [];
	for ( var i=0; i<googleJoinKey.length; ++i ) { joinKeyIndexes.push( googleJoinKey[i][0] );}
	
	// Form: add FormId to the columns if appropriate
	if ( getQuestionSelectedJoinContextAutoFieldGrouping( leftQId ) == 'form' || getQuestionSelectedJoinContextAutoFieldGrouping( rightQId ) == 'form' ){
		useLeft = getQuestionSelectedJoinContextAutoFieldGrouping( leftQId ) == 'form';
		columns = ( useLeft ? leftColumns : rightColumns );
		
		var formColumn = getColumnIndex(getColumnNameForContext('form'));
		if ( !arrayContains( columns, formColumn ) && !arrayContains( joinKeyIndexes, formColumn )){
			// Add the FormId column to the columns array if the FormId column has not yet been added,
			// and the associated question has form context
			if ( useLeft ) {
				leftColumns.splice(0,0,formColumn);
			}
			else {
				rightColumns.splice(0,0,formColumn);
			}
		}
	}
	
	// Module: add ModuleId to the columns if appropriate
	if ( getQuestionSelectedJoinContextAutoFieldGrouping( leftQId ) == 'module' || getQuestionSelectedJoinContextAutoFieldGrouping( rightQId ) == 'module' ){
		useLeft = getQuestionSelectedJoinContextAutoFieldGrouping( leftQId ) == 'module';
		columns = ( useLeft ? leftColumns : rightColumns );
		
		var moduleColumn = getColumnIndex(getColumnNameForContext('module'));
		if ( !arrayContains( columns, moduleColumn ) && !arrayContains( joinKeyIndexes, moduleColumn )){
			// Add the ModuleId column to the columns array if the ModuleId column has not yet been added,
			// and the associated question has module context
			if ( useLeft ) {
				leftColumns.splice(0,0,moduleColumn);
			}
			else {
				rightColumns.splice(0,0,moduleColumn);
			}
		}
	}
	
	// Owner: added by default; skip
	
	// FormTableRow: add FormTableRow to the columns if appropriate
	if ( hasTableContext( leftQId ) || hasTableContext( rightQId ) ) {
		useLeft = hasTableContext( leftQId );
		columns = ( useLeft ? leftColumns : rightColumns );
		
		var formTableColumn = getColumnIndex('FormTableRow');
		if ( !arrayContains( columns, formTableColumn ) && !arrayContains( joinKeyIndexes, formTableColumn )){
			// Add the FormTableRow column to the "columns" array if the FormTableRow column has not yet been added,
			// and the associated question has table context
			if ( useLeft ) {
				leftColumns.splice(0,0,formTableColumn);
			}
			else {
				rightColumns.splice(0,0,formTableColumn);
			}
		}
	}
	
	// Other: "Other" added by default when applicable; skip
}

// Returns the column index associated with the specified column
function getColumnIndex(columnName){
	if ( !allJoinColumns ) allJoinColumns = getAllJoinColumns(); 
	var index = jQuery.inArray( columnName, allJoinColumns );
	return ( (index == -1) ? null : index );
}

// Returns the Google Visualization column object that should be used for this question
function getTransformedColumnObject(qId,dataTableOrView,qColumnIndex){
	var transformedObject = new Object();
	
	var dateShowElmId = "dateSelDataShow_" + qId; // Date Transformation (month and year only, year only, month only, etc)
	var dateFormatElmId = "dateSelDataFormat_" + qId; // Date Formatting (MM/dd/yyyy, MM/YY, etc)
	var questionHasDateTransformations = (getQuestionSelectedDataType(qId) == 'date');
	
	// a. DATE TRANSFORMATION
	if ( questionHasDateTransformations ){
		// transform the dates according to the submitted criteria	
		var transformation = jQuery("#"+dateShowElmId).val();
		var format = jQuery("#"+dateFormatElmId).val();	
		var transformer = new com.healthcit.DateTableColumnTransformations(qColumnIndex,transformation,format);

		// reformat the DataTable
		var viewFormat = transformer.format(dataTableOrView);		
		
		// generate a new DataView with new date values,
		// depending on what was selected for the date transformations
		function oFunc(dataTable,rownum){return transformer.transform(dataTable,rownum);}
		transformedObject = { calc:oFunc, type:'date', label:dataTableOrView.getColumnLabel(qColumnIndex), format: viewFormat } ;
	}
	// END DATE TRANSFORMATION
	
	// TODO: NUMERIC TRANSFORMATION, STRING TRANSFORMATION, OTHER
	
	// else add the column as is
	else {
		transformedObject = qColumnIndex ;
	}
	
	return transformedObject;
}

//END Google API Enhancements

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Proprietary code functions (these functions are only implemented
// in the proprietary code
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Sets up the columns that will be appropriate for this report type.
//NOTE: This function is overriden in the proprietary code.
function resetColumnsForVisualization(reportType,data,view){	
	return new google.visualization.DataView(view);
}

//Transforms the data as appropriate for this report type.
//NOTE: This function is overriden in the proprietary code.
function transformDataForVisualization(reportType,dataTable){	
	return new google.visualization.DataView(dataTable);
}

//Returns whether or not this report type is associated with one of the secondary visualizations
function isSecondaryVisualization(reportType){
	if ( !secondaryVisualizations ) secondaryVisualizations = setUpSecondaryVisualizations();
	return secondaryVisualizations[reportType.toString()];
}

//NOTE: This function is overriden in the proprietary code.
function updateSavedReportTitleSection(elmId){
}

//NOTE: This function is overriden in the proprietary code.
function performActionOnSelectedSavedReport(){
}

//Populates the full list of saved report queries on the Welcome Screen
//NOTE: This function is overriden in the proprietary code.
function populateSavedQueryListSection(){
}

//NOTE: This function is overriden in the proprietary code.
function resetCurrentSavedReport(){	
}

// NOTE: This function is overriden in the proprietary code.
function getCurrentSavedReport() {
}
// END Proprietary Code functions

/* Methods used to derive titles for the dependent and independent axes*/

// get axis title for the independent variable
function getIndependentVarAxisTitle(){
	return getQuestionShortName( baseVarArray[ 0 ] );
}

// get the axis title for the dependent variable(s)
function getDependentVarAxisTitle() {
	var titleHash = new Object();
	
	var aggregationTitles = {'sum':'Total','count':'Count','countNonNull':'Count','countNonZeroNonNull':'Count','avg':'Average','max':'Max','min':'Min'};
	
	for ( var i=0; i<dependentVarArray.length; ++i ) {
		titleHash[ dependentVarArray[i][0] ]= getQuestionShortName(dependentVarArray[i][0]);
		var selectedAggregation = getSelectedAggregation( dependentVarArray[i][0] );
		titleHash[ dependentVarArray[i][0] ]+=
			' ' + 
			( aggregationTitles[ selectedAggregation ] ? 
			  aggregationTitles[ selectedAggregation ] : 
			  selectedAggregation.capitalizeIt() );
	}
	
	var title = new Array;
	for ( var key in titleHash ) {
		title.push( titleHash[ key ] );
	}
	return title.join(' & ');
}

// get the column name for the question
function getFormattedColumnName( qId ) {
	var shortName = jQuery("#check_" + qId).first().val();
	return getFormattedColumnNameForShortName( shortName );
}

function getFormattedColumnNameForShortName( shortName ) {
	// Update any Google Query reserved words by prepending 'C_'
	if ( jQuery.inArray( shortName.toLowerCase() , googleQueryApiReservedWords ) > -1 ) {
		shortName = 'C_' + shortName;
	}
	
	// Update numeric short names by prepending 'N_'
	if ( shortName.match(/^[0-9]+$/) ){
		shortName = 'N_' + shortName;
	}
	
	// Replace any Google Query API reserved characters with an underscore (_)
	shortName = shortName.replace(/[+-\/,*]/,'_');
	
	// Remove all whitespaces and capitalize
	var arr = shortName.split(" ");
	var newShortName = '';
	for ( var i = 0; i < arr.length; ++i ) {
		arr[ i ] = arr[ i ].capitalizeIt();
	}
	return arr.join('');
}

// get the chart height that should be used for this query
function getCurrentChartHeight(reportType){
	var baseHeight = 200;
	var numBaseVariables = baseVarArray.length;
	var numRows = groupedResultSet.getNumberOfRows();
	
	if ( parseInt(reportType) >= 6 && parseInt(reportType) <= 9 ) { //Image Line, Area, Bar, Pie Charts
		return baseHeight + ( 230 * numBaseVariables );
	}
	
	else if ( parseInt(reportType) == 5 ) { // Table
		return numRows * 30;
	}
		
	else return baseHeight + 200; //default height is 400
}

// get the question's short name
function getQuestionShortName( qId ) {
	if ( qId ) return jQuery('#check_' + qId).val();
}

// get the full list of questions
function getFullListOfQuestions() {
	var list = 
		jQuery.map(
			jQuery('input[type=checkbox][id^=check_]'),
			function( elm ){
				return { label: elm.value, 
						 questionId: elm.id.replace('check_','')}}
			);
	return list;
}

// get the question's selected data type
function getQuestionSelectedDataType( qId ) {
	if ( qId ) return jQuery('#seldata_' + qId).val();
}

// get the question's selected variable type
function getQuestionSelectedVariableType( qId ) {
	if ( qId ) return jQuery('#select_'+qId).val();
}

// return whether this question is an independent variable
function isIndependentVariable( qId ) {
	return getQuestionSelectedVariableType( qId ) == 'independent';
}

//return whether this question is a dependent variable
function isDependentVariable( qId ) {
	return getQuestionSelectedVariableType( qId ) == 'dependent';
}

//return whether this question is a filter variable
function isFilterVariable( qId ) {
	return getQuestionSelectedVariableType( qId ) == 'filter';
}

// return whether or not this question has been selected
function isQuestionSelected( qId ) {
	if ( qId ) return jQuery('#check_'+qId).is(':checked');
}

// returns the Google API join method to use when executing a join with this question (LEFT, RIGHT, FULL, etc)
function getJoinMethodForBaseVariables( qId ) {
	if ( hasTableContext( qId ) ) return getJoinMethodForFormTableQuestions();
	else return 'left';
}

function getJoinMethodForJoinedResultSet( joinContextSource ) {
	if ( hasTableContext( joinContextSource ) ) return getJoinMethodForFormTableQuestions();
	else return 'left';
}

//get the question's selected join context
function getQuestionSelectedJoinContext( qId ) {
	if ( qId ) return jQuery('#seljoin_'+qId).val();
}

function getQuestionSelectedJoinContextAutoFieldGrouping( qId ) {
	if ( qId ) {
		var other = getQuestionSelectedJoinVariableForOther( qId );
		if ( !!other ) {
			return getQuestionSelectedJoinContext( other );
		}
		else {
			return getQuestionSelectedJoinContext( qId );
		}
	}
}

//get the question's selected join variable when the join context is "Other"
function getQuestionSelectedJoinVariableForOther( qId ) {
	if ( qId ) return jQuery('#seljoinother_'+qId).val();
}

// determine if there are any selected questions with the specified data type
function hasAnySelectedDataType( dataType ) {
	if ( dataType ) return jQuery('[id^=seldata_] option:selected[value='+dataType+']').length > 0;
}

// determine if there are any autogenerated fields that have been selected
function hasAnySelectedAutogeneratedFields(){
	return ( arrayIntersection(autogeneratedQuestionFields,jQuery('input[id^=check_]:checked')
			.map(function(){
				return this.value;
			})).length > 0 );
}

// determine whether this question is an autogenerated field
function isAutogeneratedField( qId ) {
	return arrayContains( autogeneratedQuestionFields, getQuestionShortName(qId) );
}

// determine whether this question short name refers to an autogenerated field
function isAutogeneratedShortName( shortName ) {
	return arrayContains( autogeneratedQuestionFields, shortName );
}

// returns the join column field which matches this autogenerated field
function getAutogeneratedQuestionFieldMatchingJoinColumn( qId ) {
	if ( !isAutogeneratedField( qId ) ) return null;
	var hsh = autogeneratedQuestionFieldMatchingJoinColumns;
	return hsh[ getQuestionShortName( qId ) ];
}

// updates the values in the autogenerated column(s) with the values in their corresponding join key columns
function synchronizeAutogeneratedColumns(dataTable){
	for ( var i = 0; i < autogeneratedQuestionFields.length; ++i ) {
		var column = autogeneratedQuestionFields[ i ];
		var targetColumnIndex = getColumnIndexForColumnName(dataTable,column);
		var sourceColumnIndex = getColumnIndexForColumnName(dataTable,column+'Id');
		if ( targetColumnIndex && sourceColumnIndex ) {
			copyColumnInDataTable( dataTable, sourceColumnIndex, targetColumnIndex );
		}
	}
}

// function which returns all the selected questions
function getAllSelectedQuestions(){
	var selectedQuestions =
	jQuery.map(
			jQuery('input[type=checkbox][id^=check_]:checked'),
			function( elm ){
				return elm.id.replace('check_','')
			});
	return selectedQuestions;
}

// function which updates the SELECT query sent as part of the Google Query object as necessary
function getGoogleWhereClause( qId ) {
	var whereClause = '';
	// If this question is associated with both table and non-table data
	if ( isAssociatedWithBothTableAndNonTableData( qId ) ) {
		var selection = getFormTableContextTypeForQuestion( qId );
		// If the user selected to display only table data, then include a WHERE clause for only table data
		if ( selection == getTableDataOnlyContextType() ) {
			whereClause = ' WHERE (FormTableRow IS NOT NULL AND FormTableRow != \'null\')';
		}
		// If the user selected to display only non-table data, then include a WHERE clause for only non-table data
		else if ( selection == getNonTableDataOnlyContextType() ) {
			whereClause = ' WHERE (FormTableRow IS NULL OR FormTableRow = \'null\')';
		}
	}
	
	//.................(enter any other procesing logic here...)........................//
	
	// return the WHERE clause
	return whereClause;
}

// get the question Id associated with this field's shortname
// NOTE: if the shortname is not unique, this will return the first match
function getQuestionIdForShortName( shortName ){
	return jQuery('[id^=check_][value='+shortName+']:first').attr('id').split('_')[1];
}

function setQuestionSelectedDataType( qId, value ) {
	if ( qId ) return jQuery('#seldata_' + qId).val(value);
}

function showSpinner( spinnerId ) {
	showOrHideById( spinnerId, 1 );
}

function hideSpinner( spinnerId ) {
	showOrHideById( spinnerId, 2 );
}

// Methods used to provide aggregations
function addAggregationBox( qId ) {
	// Update the confirmation box
	var quesIndDepBoxTextClass = 'inddeptxt_' + qId;
	var aggregationBoxId = 'aggregation_' + qId;
	var aggregationBoxClass = 'aggtn_' + qId;	
	jQuery( '.' + quesIndDepBoxTextClass).after("<li class=\"aggregation " + aggregationBoxClass + "\"><span>Aggregation:<span id=\""+aggregationBoxId+"\"/></span></li>");

	// Derive the list of aggregation types
	var list = getListOfAggregations( qId );
	
	// Update the hash of aggregations
	aggregationSet[ qId ] = new UpAndDownSelectBox( aggregationBoxId, list );
	
}

function removeAggregationBox( qId ) {
	// Update the confirmation box
	var aggregationBoxClass = 'aggtn_' + qId;
	var aggregationBoxId = 'aggregation_' + qId;
	jQuery( '.' + aggregationBoxClass).remove();
		
	// Update the hash of aggregations
	aggregationSet[ qId ] = null;
}

function getListOfAggregations(qId){
	return hasNumericDataType( qId ) ? numericAggregationTypes : nonNumericAggregationTypes;
}

function getSelectedAggregation(qId){
	if ( aggregationSet[qId] ) {
		var value = aggregationSet[ qId ].getText();
		return value;
	}
}

function getAggregationMethodObject(qId){
	var str = getSelectedAggregation(qId);
	if ( str ){
		// Return the appropriate aggregation method for this question.

		// for the "count" aggregation,
		// use cacure.countNonNull for numeric questions
		// and sum for non-numeric questions.
		// ( EXPLANATION: Currently the only aggregation for non-numeric questions is "count".
		//   This is handled by adding a column which represents the number of CouchDB documents for each dependent variable's row.
		//   Hence, the total count is the sum of CouchDB documents in this column.)
		if ( str == 'count') {
			str = hasNumericDataType( qId ) ? 'countNonNull' : 'sum'; 
		}		

		// If a custom aggregator exists, then use it; otherwise
		// use Google's aggregator.
		var method = window['cacure'][str];
		if ( ! method ) method = window['google']['visualization']['data'][str];
		return method;
	}
}

// END Methods used to provide aggregations

//Returns whether or not the current page is the "Create Reports" screen
function isCreateReportsPage(){
	return jQuery('#table_container').is(':visible');
}

// Returns whether or not the current page is the "View Reports" screen
function isViewReportsPage(){
	return jQuery('#reports_container').is(':visible');
}

// Returns the DOM elements representing the content rows of the "reportsTable" visualization
function getAllReportTableRowElements(){
	return jQuery( '#table_container_content table tbody tr[class!=reportsTableHeader]' );
}

/* END Utility Methods to determine the current screen */

/* ~~~~~~~~~~~~~~~~~~~~~Utility methods used to update the DOM */

//Function which essentially overrides the event handler associated with this element,
//causing a different function to be executed instead
function alternateSimulateBrowserUpdate( var0, var1, var2, var3, var4, var5 ) {
	if ( var0.match(/^seljoin_/) ) { // means this element's ID is the Join Context element
		updateJoinContextAsOther(var1, var2);
	}
}

// Function which derives the question ID associated with the given DOM ID
function getQuestionIDfromDOMID( domId ) {
	var startIndex = domId.indexOf('_') + 1;
	var endIndex = matchesNonIdentifyingIdFromSimpleTable( domId ) ? SIMPLETABLEANSWER_ID_LENGTH : STANDARDQUESTION_ID_LENGTH;
	return domId.substring( startIndex, startIndex + endIndex );
}

/* ~~~~~~~~~~~~~~~~~~~~~END Utility methods used to update the DOM */

/* Other Utility Methods */
function showOrHideById( elmId, showOrHide, duration ) {
	var elm = jQuery('#' + elmId);
	if ( elm ) {
		if ( showOrHide == 1 ) { // show element
			duration ? elm.show(duration) : elm.show();
		}
		else { // hide element
			duration ? elm.hide(duration) : elm.hide();
		}
	}
}

// Modifier used to replace empty table cells with default content
// during the GROUP BY operation
function getEmptyCellValue( cellContent ) {
	if ( cellContent ) return cellContent;
	//else return 'No answer';
	else return null;
}

function isImageChartType( reportType ) {
	return reportType > 5 && reportType < 10;
}

function isTableType( reportType ) {
	return parseInt(reportType) == 5;
}

// Custom aggregators 
var cacure = {
		// returns the count of a given set of elements
		// exclusive of null values
		countNonNull: function( values ){
			return values.filter( function(val){ return ( val != null ); }).length;
		},
		// returns the count of a given set of elements
		// exclusive of null values and zero values
		countNonZeroNonNull: function( values ) {
			return values.filter( function(val){ return ( val != null && val != 0 ); }).length;
		},
		// This function can be used instead of the Google API function google.visualization.data.join().
		// In cases where the second datatable (dt2) contains duplicate keys, the standard join function will not work
		// (see documentation).
		// This function provides a workaround for this.
		// It also allows you to specify the first columns in the final resultset if they need to be different from the key columns.
		join: function(dt1, dt2, joinMethod, keys, dt1Columns, dt2Columns ){
			var dt2JoinKey = [];  // array of fields used for the join in dataTable dt2
			for ( var i = 0; i < keys.length; ++i ) {
				dt2JoinKey.push( keys[i][1] );
			}

//          (Commented out standard google API join for now)			
//			var useManyToManyJoin = ( hasDuplicateKeysInDataTable( dt2, dt2JoinKey ) || existsTableContextInCurrentQuery() );
//			if ( ! useManyToManyJoin ) {
//				return google.visualization.data.join(dt1, dt2, joinMethod, keys, dt1Columns, dt2Columns);
//			}
//			else {
				var leadingColumns = getLeadingColumnIndexes();	
				return customizedJoin(dt1, dt2, joinMethod, keys, dt1Columns, dt2Columns, leadingColumns );
//			}
		}
};

// returns an array of the indexes of the mandatory fields in each record
function getLeadingColumnIndexes(){
	if ( allJoinColumns.length == 0 ) allJoinColumns = getAllJoinColumns();
	var leadingColumns = fillArrayWithRange(0,allJoinColumns.length-1);
	return leadingColumns;
}

//Submit entities for dataExport
function exportData()
{
	if( joinedResultSet != null )
	{
		var keyParams = "";
		for(var i=0; i<joinedResultSet.getNumberOfRows(); i++){
			keyParams += joinedResultSet.getValue(i, 0)+"_"+joinedResultSet.getValue(i, 1);
			if(i < joinedResultSet.getNumberOfRows()-1){
				keyParams+=",";
			}
		}
		var token = new Date().getTime();
		overlayScreen("Creating report. Please wait...");
		jQuery.download(baseUrlString  + 'DataExportServlet',{'keys': keyParams, "token": token});		
		
		fileDownloadCheckTimer = window.setInterval(function () {
			jQuery.get(baseUrlString  + 'DataExportServlet', {token:token}, onDownloadFinish, "text");
		}, 1000);		
	}
	
	function onDownloadFinish(status){
		if(status){
			if(status=='FINISHED'){
				removeOverlayScreen();
				window.clearInterval(fileDownloadCheckTimer);
			} else if(status=='ERROR'){
				removeOverlayScreen();
				jAlert("Error occurred while creating data dump.");				
				window.clearInterval(fileDownloadCheckTimer);
			}
		} else {
			removeOverlayScreen();
			jAlert("Error occurred while creating data dump.");				
			window.clearInterval(fileDownloadCheckTimer);
		}	
	};	
	
}