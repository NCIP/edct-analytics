/**
 * UpAndDownSelectBox creates a select box widget with a single down arrow.
 * As the user clicks on the down arrow, the widget will display each item
 * in the provided list. 
 * 
 * Sample code:
 * <script type="text/javascript">var selectBox = new UpAndDownSelectBox('cities',['Rockville','Bethesda','Chevy Chase','Bowie','Annapolis'],2);<//script>
 * <<div>Select a city: <span id='cities'/> <</div>
 * @author Oawofolu
 */

var SELECTBOX_OPTION_PREFIX = 'upDown__Option_';

function UpAndDownSelectBox( containerId, list, defIndex ){
	if ( !containerId ) containerId = 'null';
	this.container = document.getElementById(containerId);
	if ( !this.container || !isArray(list)) {
		return;
	}
	
	this.valueList = list;
	this.currentIndex = defIndex ? parseInt(defIndex) : 0;
	this.textBox = createDocumentElement('span', {'class':'upAndDownTextBox','id':containerId + 'TextBox','value':this.currentIndex}, this.valueList[ this.currentIndex ] );
	this.arrowImg = createDocumentElement('span',{ 'class':'upAndDownTextBoxArrow','id': containerId + 'UpDownArrow','alt':'Click to change'});
	this.selectBox = createDocumentElement('div',{'class':'upAndDownSelectBox','id': containerId + 'SelectBox'});
	this.container.appendChild(this.textBox);
	this.container.appendChild(this.arrowImg);
					
	function getText(){
		return this.textBox.innerHTML;
	}
	
	function getValue(){
		return this.currentIndex;
	}
	
	function setTextBox(index,obj){
		if ( ! obj ) obj = this;
		removeCssClass( SELECTBOX_OPTION_PREFIX + obj.currentIndex, 'selected');
		obj.currentIndex = index;		
		obj.textBox.innerHTML = obj.valueList[ obj.currentIndex ];	
		obj.textBox.setAttribute( 'value', obj.currentIndex );
		addCssClass( SELECTBOX_OPTION_PREFIX + obj.currentIndex, 'selected');
	}
	
	function setSelectBox(){		
		for ( var index = 0; index < this.valueList.length; ++index ) {
			var option = createDocumentElement('div',{'class':'option','id': SELECTBOX_OPTION_PREFIX + index},this.valueList[ index ]);
			if ( index == this.currentIndex ) option.className += ' selected';
			var obj = this;
			option.onclick = function(){
				var selectedIndex = parseInt(this.id.match(new RegExp( SELECTBOX_OPTION_PREFIX + '([0-9]+)$') )[1]);
				if ( selectedIndex != NaN ){			
					obj.setTextBox( selectedIndex );
					hideElement(obj.selectBox);
				}
			};
			this.selectBox.appendChild( option );
		}
		this.container.appendChild(this.selectBox);
	}
		
	this.getText = getText;
	this.getValue = getValue;
	this.setTextBox = setTextBox;
	this.setSelectBox = setSelectBox;
	this.setSelectBox();
	
	var obj = this;
	this.arrowImg.onclick = function(){		
		showElement(obj.selectBox);
	}
	this.textBox.onclick = function(){
		var value = document.getElementById(containerId + 'TextBox').getAttribute('value');
		setTextBox(value,obj);
	}
}

/* Utility Methods */
function isArray(list){
	if ( list ) return list.constructor.toString().indexOf('Array()') > -1 ;
}

function removeCssClass( elmId, className ){
	var elm = document.getElementById( elmId );
	if ( elm ) elm.className = elm.className.replace(new RegExp(className,'g'),'');
}

function addCssClass( elmId, className ) {
	removeCssClass( elmId, className );
	var elm = document.getElementById( elmId );
	if ( elm ) elm.className += ' ' + className;
}

function createDocumentElement( elmType, properties, innerHTML )
{
	var elm = document.createElement( elmType );
	if ( properties )
	{
		for ( var property in properties ){
			elm.setAttribute( property, properties[property] );
		}
	}
	if ( innerHTML ) elm.innerHTML = innerHTML;
	return elm;
}

function showElement( elm ) {
	elm.style.display = 'block';
}

function hideElement( elm ) {
	elm.style.display = 'none';
}