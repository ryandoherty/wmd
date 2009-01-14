var Attacklab = Attacklab || {};

Attacklab.wmdBase = function(){

	var self = top;
	var wmd = self["Attacklab"];
	var doc = self["document"];
	var re = self["RegExp"];
	var nav = self["navigator"];
	
	wmd.Util = {};
	wmd.Position = {};
	wmd.Command = {};
	
	var util = wmd.Util;
	var position = wmd.Position;
	var command = wmd.Command;
	
	wmd.Util.IE = (nav.userAgent.indexOf("MSIE") != -1);
	wmd.Util.oldIE = (nav.userAgent.indexOf("MSIE 6.") != -1 || nav.userAgent.indexOf("MSIE 5.") != -1);
	wmd.Util.newIE = !wmd.Util.oldIE && (nav.userAgent.indexOf("MSIE") != -1);
	
	// -------------------------------------------------------------------
	//  CHANGES
	//
	// As much as possible, I've tried to localize the things you are
	// likely to change to this area.
	// -------------------------------------------------------------------
	
	// The text that appears on the upper part of the dialog box when
	// entering links.
	var imageDialogText = "<p style='margin-top: 0px'><b>Enter the image URL.</b></p><p>You can also add a title, which will be displayed as a tool tip.</p><p>Example:<br />http://wmd-editor.com/images/cloud1.jpg   \"Optional title\"</p>";
	var linkDialogText = "<p style='margin-top: 0px'><b>Enter the web address.</b></p><p>You can also add a title, which will be displayed as a tool tip.</p><p>Example:<br />http://wmd-editor.com/   \"Optional title\"</p>";
	
	// The default text that appears in the dialog input box when entering
	// links.
	var imageDefaultText = "http://";
	var linkDefaultText = "http://";
	
	
	

	// -------------------------------------------------------------------
	
	// Returns true if the DOM element is visible, false if it's hidden.
	// Checks if display is anything other than none.
	util.isVisible = function (elem) {
	
	    if (window.getComputedStyle) {
	        // Most browsers
			return window.getComputedStyle(elem, null).getPropertyValue("display") !== "none";
		}
		else if (elem.currentStyle) {
		    // IE
			return elem.currentStyle["display"] !== "none";
		}
	};
	
	
	// Like getElementsByTagName() but searches for a CSS class
	// instead of a tag name.
	// If searchTag is not specified, all tags will be searched.
	util.getElementsByClass = function(searchClass, searchTag){
	
		var results = [];
		
		if (searchTag === null) {
			searchTag = "*";
		}
		
		var elements = doc.getElementsByTagName(searchTag);
		var regex = new re("(^|\\s)" + searchClass + "(\\s|$)");
		
		for (var i = 0; i < elements.length; i++) {
			if (regex.test(elements[i].className.toLowerCase())) {
				results.push(elements[i]);
			}
		}
		
		return results;
	};
	
	
	// Adds a listener callback to a DOM element which is fired on a specified
	// event.
	util.addEvent = function(elem, event, listener){
		if (elem.attachEvent) {
			// IE only.  The "on" is mandatory.
			elem.attachEvent("on" + event, listener);
		}
		else {
			// Other browsers.
			elem.addEventListener(event, listener, false);
		}
	};

	
	// Removes a listener callback from a DOM element which is fired on a specified
	// event.
	util.removeEvent = function(elem, event, listener){
		if (elem.detachEvent) {
			// IE only.  The "on" is mandatory.
			elem.detachEvent("on" + event, listener);
		}
		else {
			// Other browsers.
			elem.removeEventListener(event, listener, false);
		}
	};


	// Extends a regular expression.  Returns a new RegExp
	// using pre + regex + post as the expression.
	// Used in a few functions where we have a base
	// expression and we want to pre- or append some
	// conditions to it (e.g. adding "$" to the end).
	// The flags are unchanged.
	//
	// regex is a RegExp, pre and post are strings.
	util.extendRegExp = function(regex, pre, post){
		
		if (pre === null || pre === undefined)
		{
			pre = "";
		}
		if(post === null || post === undefined)
		{
			post = "";
		}
		
		var pattern = regex.toString();
		var flags;
		
		// Replace the flags with empty space and store them.
		pattern = pattern.replace(/\/([gim]*)$/, "");
		flags = re.$1;
		
		// Remove the slash delimiters on the regular expression.
		pattern = pattern.replace(/(^\/|\/$)/g, "");
		pattern = pre + pattern + post;
		
		return new re(pattern, flags);
	}
	
	
	// Check to see if a node is not a parent and not hidden.
	// OK for what???
	util.elementOk = function(elem){
		if (!elem || !elem.parentNode) {
			return false;
		}
		
		return util.isVisible(elem);
	};
	
	
	// DONE - cleaned up - jslint clean
	// Sets the image for a "button" on the WMD editor.
	util.setImage = function(elem, imgPath){
	
		imgPath = wmd.basePath + imgPath;
		
		if (nav.userAgent.indexOf("MSIE") != -1) {
			// Internet Explorer
			var child = elem.firstChild;
			var style = child.style;
			style.filter = "progid:DXImageTransform.Microsoft." + "AlphaImageLoader(src='" + imgPath + "')";
		}
		else {
			// Regular browser
			elem.src = imgPath;
		}
		
		return elem;
	};
	
	// DONE - reworked slightly and jslint clean
	util.createImage = function(img, width, height){
	
		img = wmd.basePath + img;
		var elem;
		
		if (nav.userAgent.indexOf("MSIE") !== -1) {
		
			// IE-specific
			elem = doc.createElement("span");
			var style = elem.style;
			style.display = "inline-block";
			style.height = "1px";
			style.width = "1px";
			elem.unselectable = "on";
			
			var span = doc.createElement("span");
			style = span.style;
			style.display = "inline-block";
			style.height = "1px";
			style.width = "1px";
			style.filter = "progid:DXImageTransform.Microsoft." + "AlphaImageLoader(src='" + img + "')";
			span.unselectable = "on";
			elem.appendChild(span);
		}
		else {
		
			// Rest of the world
			elem = doc.createElement("img");
			elem.style.display = "inline";
			elem.src = img;
		}
		
		elem.style.border = "none";
		elem.border = "0";
		
		if (width && height) {
			elem.style.width = width + "px";
			elem.style.height = height + "px";
		}
		return elem;
	};
	
	// TODO: Clean up dialog creation code, perhaps in a real constructor.
	//
	// This is the thing that pops up and asks for the URL when you click the hyperlink button.
	// text: The html for the input box.
	// defaultInputText: The default value that appears in the input box.
	// callback: The function which is executed when the prompt is dismissed, either via OK or Cancel
	util.prompt = function(text, defaultInputText, callback){
	
		// These variables need to be declared at this level since they are used
		// in multiple functions.
		var dialog;			// The dialog box.
		var background;		// The background beind the dialog box.
		var input;			// The text box where you enter the hyperlink.
		
		// Used as a keydown event handler. Esc dismisses the prompt.
		// Key code 27 is ESC.
		var checkEscape = function(key){
			var code = (key.charCode || key.keyCode);
			if (code === 27) {
				close(true);
			}
		};
		
		// Dismisses the hyperlink input box.
		// isCancel is true if don't care about the input text.
		// isCancel is false if we are going to keep the text.
		var close = function(isCancel){
			util.removeEvent(doc.body, "keydown", checkEscape);
			var text = input.value;
			if (isCancel) {
				text = null;
			}
			dialog.parentNode.removeChild(dialog);
			background.parentNode.removeChild(background);
			callback(text);
			return false;
		};
		
		// Shouldn't this go someplace else?
		// Like maybe at the top?
		if (defaultInputText === undefined) {
			defaultInputText = "";
		}
		
		// Creates the background behind the hyperlink text entry box.
		// Most of this has been moved to CSS but the div creation and
		// browser-specific hacks remain here.
		var createBackground = function(){
		
			background = doc.createElement("div");
			background.className = "wmd-prompt-background";
			
			// Some versions of Konqueror don't support transparent colors
			// so we make the whole window transparent, frustrating the users.
			if (/konqueror/.test(nav.userAgent.toLowerCase())){
				background.style.backgroundColor = "transparent";
			}
			
			doc.body.appendChild(background);
		};
		
		// Create the text input box form/window.
		var createDialog = function(){
		
			// The main dialog box.
			dialog = doc.createElement("div");
			dialog.className = "wmd-prompt-dialog";
			
			// The dialog text.
			var question = doc.createElement("div");
			question.innerHTML = text;
			dialog.appendChild(question);
			
			// The web form container for the text box and buttons.
			var form = doc.createElement("form");
			form.onsubmit = function(){
				return close();
			};
			dialog.appendChild(form);
			
			// The input text box
			input = doc.createElement("input");
			input.type = "text";
			input.value = defaultInputText;
			form.appendChild(input);
			
			// The ok button
			var okButton = doc.createElement("input");
			okButton.type = "button";
			okButton.onclick = function(){
				return close();
			};
			okButton.value = "OK";

			
			// The cancel button
			var cancelButton = doc.createElement("input");
			cancelButton.type = "button";
			cancelButton.onclick = function(){
				return close(true);
			};
			cancelButton.value = "Cancel";

			// The order of these buttons is different on macs.
			if (/mac/.test(nav.platform.toLowerCase())) {
				form.appendChild(cancelButton);
				form.appendChild(okButton);
			}
			else {
				form.appendChild(okButton);
				form.appendChild(cancelButton);
			}
			
			
			if (wmd.Util.oldIE) {
				// Might want to move to CSS in conditional comment.
				dialog.style.position = "absolute";
				dialog.style.top = doc.documentElement.scrollTop + 200 + "px";
			}

			util.addEvent(doc.body, "keydown", checkEscape);
			doc.body.appendChild(dialog);
			
			// This has to be done AFTER adding the dialog to the form if you want it to be centered.
			dialog.style.marginTop = -(position.getHeight(dialog) / 2) + "px";
			dialog.style.marginLeft = -(position.getWidth(dialog) / 2) + "px";
			
		};
		
		// Why isn't this stuff all in one place?
		createBackground();
		
		self.setTimeout(function(){
		
			createDialog();
			
			// Select the default input box text.
			var defTextLen = defaultInputText.length;
			if (input.selectionStart !== undefined) {
				input.selectionStart = 0;
				input.selectionEnd = defTextLen;
			}
			else 
				if (input.createTextRange) {
					var range = input.createTextRange();
					range.collapse(false);
					range.moveStart("character", -defTextLen);
					range.moveEnd("character", defTextLen);
					range.select();
				}
			
			input.focus();
		}, 0);
	};
	
	// UNFINISHED - almost a direct copy of original function
	// except that I use !== and flip a and b in the second test block.
	util.objectsEqual = function(a, b){
		for (var key in a) {
			if (a[key] !== b[key]) {
				return false;
			}
		}
		for (key in b) {
			if (b[key] !== a[key]) {
				return false;
			}
		}
		return true;
	};
	
	// UNFINISHED - direct copy of the original function
	util.cloneObject = function(obj){
		var result = {};
		for (var key in obj) {
			result[key] = obj[key];
		}
		return result;
	};
	
	// DONE - updated - jslint clean
	position.getPageSize = function(){
	
		var scrollWidth, scrollHeight;
		var innerWidth, innerHeight;
		
		// It's not very clear which blocks work with which browsers.
		if (self.innerHeight && self.scrollMaxY) {
			scrollWidth = doc.body.scrollWidth;
			scrollHeight = self.innerHeight + self.scrollMaxY;
		}
		else 
			if (doc.body.scrollHeight > doc.body.offsetHeight) {
				scrollWidth = doc.body.scrollWidth;
				scrollHeight = doc.body.scrollHeight;
			}
			else {
				scrollWidth = doc.body.offsetWidth;
				scrollHeight = doc.body.offsetHeight;
			}
		
		if (self.innerHeight) {
			// Non-IE browser
			innerWidth = self.innerWidth;
			innerHeight = self.innerHeight;
		}
		else 
			if (doc.documentElement && doc.documentElement.clientHeight) {
				// Some versions of IE (IE 6 w/ a DOCTYPE declaration)
				innerWidth = doc.documentElement.clientWidth;
				innerHeight = doc.documentElement.clientHeight;
			}
			else 
				if (doc.body) {
					// Other versions of IE
					innerWidth = doc.body.clientWidth;
					innerHeight = doc.body.clientHeight;
				}
		
		var maxWidth = Math.max(scrollWidth, innerWidth);
		var maxHeight = Math.max(scrollHeight, innerHeight);
		return [maxWidth, maxHeight, innerWidth, innerHeight];
	};
	
	// DONE - jslint clean
	position.getPixelVal = function(val){
		if (val && /^(-?\d+(\.\d*)?)px$/.test(val)) {
			return re.$1;
		}
		return undefined;
	};
	
	// UNFINISHED
	// The assignment in the while loop makes jslint cranky.
	// I'll change it to a for loop later.
	position.getTop = function(elem, isInner){
		var result = elem.offsetTop;
		if (!isInner) {
			while (elem = elem.offsetParent) {
				result += elem.offsetTop;
			}
		}
		return result;
	};
	
	// DONE - updated
	position.setTop = function(elem, newTop, isInner){
		var curTop = position.getPixelVal(elem.style.top);
		if (curTop === undefined) {
			elem.style.top = newTop + "px";
			curTop = newTop;
		}
		
		var offset = position.getTop(elem, isInner) - curTop;
		elem.style.top = (newTop - offset) + "px";
	};
	
	// UNFINISHED
	// The assignment in the while loop makes jslint cranky.
	// I'll change it to a for loop later.
	position.getLeft = function(elem, isInner){
		var result = elem.offsetLeft;
		if (!isInner) {
			while (elem = elem.offsetParent) {
				result += elem.offsetLeft;
			}
		}
		return result;
	};
	
	// DONE - updated
	position.setLeft = function(elem, newLeft, isInner){
		var curLeft = position.getPixelVal(elem.style.left);
		if (curLeft === undefined) {
			elem.style.left = newLeft + "px";
			curLeft = newLeft;
		}
		var offset = position.getLeft(elem, isInner) - curLeft;
		elem.style.left = (newLeft - offset) + "px";
	};
	
	// DONE - copied from cky (simplified)
	position.getHeight = function(elem){
		return elem.offsetHeight || elem.scrollHeight;
	};
	
	// DONE - copied from cky
	position.setHeight = function(elem, newHeight){
		var curHeight = position.getPixelVal(elem.style.height);
		if (curHeight == undefined) {
			elem.style.height = newHeight + "px";
			curHeight = newHeight;
		}
		var offset = position.getHeight(elem) - curHeight;
		if (offset > newHeight) {
			offset = newHeight;
		}
		elem.style.height = (newHeight - offset) + "px";
	};
	
	// DONE - copied from cky (simplified)
	position.getWidth = function(elem){
		return elem.offsetWidth || elem.scrollWidth;
	};
	
	// DONE - copied from cky
	position.setWidth = function(elem, newWidth){
		var curWidth = position.getPixelVal(elem.style.width);
		if (curWidth == undefined) {
			elem.style.width = newWidth + "px";
			curWidth = newWidth;
		}
		var offset = position.getWidth(elem) - curWidth;
		if (offset > newWidth) {
			offset = newWidth;
		}
		elem.style.width = (newWidth - offset) + "px";
	};
	
	// DONE - copied from cky
	position.getWindowHeight = function(){
		if (self.innerHeight) {
			return self.innerHeight;
		}
		else 
			if (doc.documentElement && doc.documentElement.clientHeight) {
				return doc.documentElement.clientHeight;
			}
			else 
				if (doc.body) {
					return doc.body.clientHeight;
				}
	};
	
	// DONE - slightly improved - jslint clean
	//
	// Watches the input textarea, polling at an interval and runs
	// a callback function if anything has changed.
	wmd.inputPoller = function(inputArea, callback, interval){
	
		var pollerObj = this;
		
		// Stored start, end and text.  Used to see if there are changes to the input.
		var lastStart;
		var lastEnd;
		var markdown;
		
		var killHandle; // Used to cancel monitoring on destruction.
		// Checks to see if anything has changed in the textarea.
		// If so, it runs the callback.
		this.tick = function(){
		
			// Silently die if the input area is hidden, etc.
			if (!util.elementOk(inputArea)) {
				return;
			}
			
			// Update the selection start and end, text.
			if (inputArea.selectionStart || inputArea.selectionStart === 0) {
				var start = inputArea.selectionStart;
				var end = inputArea.selectionEnd;
				if (start != lastStart || end != lastEnd) {
					lastStart = start;
					lastEnd = end;
					
					if (markdown != inputArea.value) {
						markdown = inputArea.value;
						return true;
					}
				}
			}
			return false;
		};
		
		
		var doTickCallback = function(){
		
			if (!util.isVisible(inputArea)) {
				return;
			}
			
			// If anything has changed, call the function.
			if (pollerObj.tick()) {
				callback();
			}
		};
		
		// Set how often we poll the textarea for changes.
		var assignInterval = function(){
			if (interval === undefined) {
				interval = 500;
			}
			killHandle = self.setInterval(doTickCallback, interval);
		};
		
		this.destroy = function(){
			self.clearInterval(killHandle);
		};
		
		assignInterval();
	};
	
	// DONE
	// Handles pushing and popping textareaStates for undo/redo commands.
	// I should rename the stack variables to list.
	wmd.undoManager = function(elem, callback){
	
		var undoObj = this;
		var undoStack = []; // A stack of undo states
		var stackPtr = 0; // The index of the current state
		var mode = "none";
		var lastState; // The last state
		var timer; // The setTimeout handle for cancelling the timer
		var inputStateObj;
		
		// Set the mode for later logic steps.
		var setMode = function(newMode, noSave){
		
			if (mode != newMode) {
				mode = newMode;
				if (!noSave) {
					saveState();
				}
			}
			
			if (!wmd.Util.IE || mode != "moving") {
				timer = self.setTimeout(refreshState, 1);
			}
			else {
				inputStateObj = null;
			}
		};
		
		// Force a stack addition and the poller to process.
		var refreshState = function(){
			inputStateObj = new wmd.textareaState(elem);
			timer = undefined;
		};
		
		this.setCommandMode = function(){
			mode = "command";
			saveState();
			timer = self.setTimeout(refreshState, 0);
		};
		
		this.canUndo = function(){
			return stackPtr > 1;
		};
		
		this.canRedo = function(){
			if (undoStack[stackPtr + 1]) {
				return true;
			}
			return false;
		};
		
		// Removes the last state and restores it.
		this.undo = function(){
		
			if (undoObj.canUndo()) {
				if (lastState) {
					// What about setting state -1 to null or checking for undefined?
					lastState.restore();
					lastState = null;
				}
				else {
					undoStack[stackPtr] = new wmd.textareaState(elem);
					undoStack[--stackPtr].restore();
					
					if (callback) {
						callback();
					}
				}
			}
			
			mode = "none";
			elem.focus();
			refreshState();
		};
		
		// Redo an action.
		this.redo = function(){
		
			if (undoObj.canRedo()) {
			
				undoStack[++stackPtr].restore();
				
				if (callback) {
					callback();
				}
			}
			
			mode = "none";
			elem.focus();
			refreshState();
		};
		
		// Push the input area state to the stack.
		var saveState = function(){
		
			var currState = inputStateObj || new wmd.textareaState(elem);
			
			if (!currState) {
				return false;
			}
			if (mode == "moving") {
				if (!lastState) {
					lastState = currState;
				}
				return;
			}
			if (lastState) {
				if (undoStack[stackPtr - 1].text != lastState.text) {
					undoStack[stackPtr++] = lastState;
				}
				lastState = null;
			}
			undoStack[stackPtr++] = currState;
			undoStack[stackPtr + 1] = null;
			if (callback) {
				callback();
			}
		};
		
		var handleCtrlYZ = function(event){
		
			var handled = false;
			
			if (event.ctrlKey || event.metaKey) {
			
				// IE and Opera do not support charCode.
				var keyCode = event.charCode || event.keyCode;
				var keyCodeChar = String.fromCharCode(keyCode);
				
				switch (keyCodeChar) {
				
					case "y":
						undoObj.redo();
						handled = true;
						break;
						
					case "z":
						if (!event.shiftKey) {
							undoObj.undo();
						}
						else {
							undoObj.redo();
						}
						handled = true;
						break;
				}
			}
			
			if (handled) {
				if (event.preventDefault) {
					event.preventDefault();
				}
				if (self.event) {
					self.event.returnValue = false;
				}
				return;
			}
		};
		
		// Set the mode depending on what is going on in the input area.
		var handleModeChange = function(event){
		
			if (!event.ctrlKey && !event.metaKey) {
			
				var keyCode = event.keyCode;
				
				if ((keyCode >= 33 && keyCode <= 40) || (keyCode >= 63232 && keyCode <= 63235)) {
					// 33 - 40: page up/dn and arrow keys
					// 63232 - 63235: page up/dn and arrow keys on safari
					setMode("moving");
				}
				else 
					if (keyCode == 8 || keyCode == 46 || keyCode == 127) {
						// 8: backspace
						// 46: delete
						// 127: delete
						setMode("deleting");
					}
					else 
						if (keyCode == 13) {
							// 13: Enter
							setMode("newlines");
						}
						else 
							if (keyCode == 27) {
								// 27: escape
								setMode("escape");
							}
							else 
								if ((keyCode < 16 || keyCode > 20) && keyCode != 91) {
									// 16-20 are shift, etc. 
									// 91: left window key
									// I think this might be a little messed up since there are
									// a lot of nonprinting keys above 20.
									setMode("typing");
								}
			}
		};
		
		var setEventHandlers = function(){
		
			util.addEvent(elem, "keypress", function(event){
				// keyCode 89: y
				// keyCode 90: z
				if ((event.ctrlKey || event.metaKey) && (event.keyCode == 89 || event.keyCode == 90)) {
					event.preventDefault();
				}
			});
			
			var handlePaste = function(){
				if (wmd.Util.IE || (inputStateObj && inputStateObj.text != elem.value)) {
					if (timer == undefined) {
						mode = "paste";
						saveState();
						refreshState();
					}
				}
			};
			
			
			util.addEvent(elem, "keydown", handleCtrlYZ);
			util.addEvent(elem, "keydown", handleModeChange);
			
			util.addEvent(elem, "mousedown", function(){
				setMode("moving");
			});
			elem.onpaste = handlePaste;
			elem.ondrop = handlePaste;
		};
		
		var init = function(){
			setEventHandlers();
			refreshState();
			saveState();
		};
		
		this.destroy = function(){
		};
		
		init();
	};
	
	// I think my understanding of how the buttons and callbacks are stored in the array is incomplete.
	wmd.editor = function(inputBox, previewRefreshCallback){
	
		if (!previewRefreshCallback) {
			previewRefreshCallback = function(){
			};
		}
		
		// Width and height of the button bar for the util.skin function.
		// Why are they hard-coded here?
		var btnBarHeight = 28;
		var btnBarWidth = 4076;
		
		var offsetHeight = 0;
		
		// These saved values are used to see if the editor has been resized.
		var savedHeight;
		var savedLeft;
		
		var editObj = this;
		
		var mainDiv;
		var mainSpan;
		
		var div; // used in the _dc function.  I should rename this.
		
		// Used to cancel recurring events from setInterval.
		var resizePollHandle;
		var creationHandle;
		
		var undoMgr; // The undo manager
		var undoImage; // The image on the undo button
		var redoImage; // The image on the redo button
		var buttonCallbacks = []; // Callbacks for the buttons at the top of the input area
		
		// Saves the input state at the time of button click and performs the button function.
		// The parameter is the function performed when this function is called.
		var saveStateDoButtonAction = function(callback){
		
			if (undoMgr) {
				undoMgr.setCommandMode();
			}
			
			var state = new wmd.textareaState(inputBox);
			
			if (!state) {
				return;
			}
			
			var chunks = state.getChunks();
			
			// This seems like a very convoluted way of performing the action.
			var performAction = function(){
			
				inputBox.focus();
				
				if (chunks) {
					state.setChunks(chunks);
				}
				
				state.restore();
				previewRefreshCallback();
			};
			
			var action = callback(chunks, performAction);
			
			if (!action) {
				performAction();
			}
		};
		
		// Perform the button's action.
		var doClick = function(button){
		
			inputBox.focus();
			
			if (button.textOp) {
				saveStateDoButtonAction(button.textOp);
			}
			
			if (button.execute) {
				button.execute(editObj);
			}
		};
		
		var setStyle = function(elem, isEnabled){
		
			var style = elem.style;
			
			if (isEnabled) {
				style.opacity = "1.0";
				style.KHTMLOpacity = "1.0";
				if (wmd.Util.newIE) {
					style.filter = "";
				}
				if (wmd.Util.oldIE) {
					style.filter = "chroma(color=fuchsia)";
				}
				style.cursor = "pointer";
				
				// Creates the highlight box.
				elem.onmouseover = function(){
					style.backgroundColor = "lightblue";
					style.border = "1px solid blue";
				};
				
				// Removes the highlight box.
				elem.onmouseout = function(){
					style.backgroundColor = "";
					style.border = "1px solid transparent";
					if (wmd.Util.oldIE) {
						style.borderColor = "fuchsia";
						style.filter = "chroma(color=fuchsia)" + style.filter;
					}
				};
			}
			else {
				style.opacity = "0.4";
				style.KHTMLOpacity = "0.4";
				if (wmd.Util.oldIE) {
					style.filter = "chroma(color=fuchsia) alpha(opacity=40)";
				}
				if (wmd.Util.newIE) {
					style.filter = "alpha(opacity=40)";
				}
				style.cursor = "";
				style.backgroundColor = "";
				if (elem.onmouseout) {
					elem.onmouseout();
				}
				elem.onmouseover = elem.onmouseout = null;
			}
		};
		
		var addButtonCallback = function(callback){
			callback && buttonCallbacks.push(callback);
		};
		
		var addButtonSeparator = function(){
			buttonCallbacks.push("|");
		};
		
		// Creates a separator in the button row at the top of the input area.
		var makeButtonSeparator = function(){
			
			var sepImage = util.createImage("images/separator.png", 20, 20);
			sepImage.className = "wmd-button-separator";
			doc.getElementById("wmd-button-bar").appendChild(sepImage);
			
		};
		
		var makeButton = function(button){
		
			if (button.image) {
			
				// Create the image and add properties.
				var btnImage = util.createImage(button.image, 16, 16);
				btnImage.border = 0;
				if (button.description) {
					var desc = button.description;
					if (button.key) {
						var ctrl = " Ctrl+";
						desc += ctrl + button.key.toUpperCase();
					}
					btnImage.title = desc;
				}
				
				// Set the button's style.
				setStyle(btnImage, true);
				var style = btnImage.style;
				style.margin = "0px";
				style.padding = "1px";
				style.marginTop = "7px";
				style.marginBottom = "5px";
				
				btnImage.onmouseout();
				
				btnImage.onclick = function(){
					if (btnImage.onmouseout) {
						btnImage.onmouseout();
					}
					doClick(button);
					return false;
				};
				doc.getElementById("wmd-button-bar").appendChild(btnImage);
				return btnImage;
			}
			
			return;
		};
		
		// Creates the button row above the input area.
		var makeButtonRow = function(){
		
			for (var callback in buttonCallbacks) {
			
				if (buttonCallbacks[callback] == "|") {
					makeButtonSeparator();
				}
				else {
					makeButton(buttonCallbacks[callback]);
				}
			}
		};
		
		var setupUndoRedo = function(){
			if (undoMgr) {
				setStyle(undoImage, undoMgr.canUndo());
				setStyle(redoImage, undoMgr.canRedo());
			}
		};
		
		var createEditor = function(){
		
			if (inputBox.offsetParent) {
			
				div = doc.createElement("div");
				
				var style = div.style;
				style.visibility = "hidden";
				style.top = style.left = style.width = "0px";
				style.display = "inline";
				style.cssFloat = "left";
				style.overflow = "visible";
				style.opacity = "0.999";
				
				mainDiv.style.position = "absolute";
				
				div.appendChild(mainDiv);
				
				inputBox.style.marginTop = "";
				var height1 = position.getTop(inputBox);
				
				inputBox.style.marginTop = "0";
				var height2 = position.getTop(inputBox);
				
				offsetHeight = height1 - height2;
				
				setupWmdButton();
				inputBox.parentNode.insertBefore(div, inputBox);
				
				setDimensions();
				
				style.visibility = "visible";
				
				return true;
			}
			return false;
		};
		
		var setButtonCallbacks = function(){
		
			var buttons = wmd.wmd_env.buttons.split(/\s+/);
			
			for (var btn in buttons) {
			
				switch (buttons[btn]) {
					case "|":
						addButtonSeparator();
						break;
					case "bold":
						addButtonCallback(command.bold);
						break;
					case "italic":
						addButtonCallback(command.italic);
						break;
					case "link":
						addButtonCallback(command.link);
						break;
				}
				
				if (wmd.full) {
					switch (buttons[btn]) {
						case "blockquote":
							addButtonCallback(command.blockquote);
							break;
						case "code":
							addButtonCallback(command.code);
							break;
						case "image":
							addButtonCallback(command.img);
							break;
						case "ol":
							addButtonCallback(command.ol);
							break;
						case "ul":
							addButtonCallback(command.ul);
							break;
						case "heading":
							addButtonCallback(command.h1);
							break;
						case "hr":
							addButtonCallback(command.hr);
							break;
					}
				}
			}
			return;
		};
		
		var setupEditor = function(){
		
			if (/\?noundo/.test(doc.location.href)) {
				wmd.nativeUndo = true;
			}
			
			if (!wmd.nativeUndo) {
				undoMgr = new wmd.undoManager(inputBox, function(){
					previewRefreshCallback();
					setupUndoRedo();
				});
			}
			
			mainDiv = doc.createElement("div");
			mainDiv.style.display = "block";
			mainDiv.style.zIndex = 100;
			if (!wmd.full) {
				mainDiv.title += "\n(Free Version)";
			}
			mainDiv.unselectable = "on";
			mainDiv.onclick = function(){
				inputBox.focus();
			};
			
			mainSpan = doc.createElement("span");
			var style = mainSpan.style;
			style.height = "auto";
			style.paddingBottom = "2px";
			style.lineHeight = "0";
			style.paddingLeft = "15px";
			style.paddingRight = "65px";
			style.display = "block";
			style.position = "absolute";
			mainSpan.unselectable = "on";
			mainDiv.appendChild(mainSpan);
			
			// The autoindent callback always exists, even though there's no actual button for it.
			// It's only called when shift-enter is pressed and we're making a list.
			addButtonCallback(command.autoindent);
			
			setButtonCallbacks();
			makeButtonRow();
			
			// Create the undo/redo buttons.
			if (undoMgr) {
				makeButtonSeparator();
				undoImage = makeButton(command.undo);
				redoImage = makeButton(command.redo);
				
				var platform = nav.platform.toLowerCase();
				if (/win/.test(platform)) {
					undoImage.title += " - Ctrl+Z";
					redoImage.title += " - Ctrl+Y";
				}
				else if (/mac/.test(platform)) {
					undoImage.title += " - Ctrl+Z";
					redoImage.title += " - Ctrl+Shift+Z";
				}
				else {
					undoImage.title += " - Ctrl+Z";
					redoImage.title += " - Ctrl+Shift+Z";
				}
			}
			
			var keyEvent = "keydown";
			if (nav.userAgent.indexOf("Opera") != -1) {
				keyEvent = "keypress";
			}
			
			util.addEvent(inputBox, keyEvent, function(key){
			
				var isButtonKey = false;
				
				// Check to see if we have a button key and, if so execute the callback.
				if (key.ctrlKey || key.metaKey) {
				
					var keyCode = key.charCode || key.keyCode;
					var keyCodeStr = String.fromCharCode(keyCode).toLowerCase();
					
					// Bugfix for messed up DEL and .
					if (keyCode === 46) {
						keyCodeStr = "";
					}
					if (keyCode === 190) {
						keyCodeStr = ".";
					}
					
					for (var callback in buttonCallbacks) {
					
						var button = buttonCallbacks[callback];
						
						if (!key.altKey && !key.shiftKey && ((button.key && (keyCodeStr === button.key)))) {
							doClick(button);
							isButtonKey = true;
						}
					}
				}
				
				// This should be moved into the if test in the for loop.
				if (isButtonKey) {
					if (key.preventDefault) {
						key.preventDefault();
					}
					if (self.event) {
						self.event.returnValue = false;
					}
				}
			});
			
			// Auto-indent on shift-enter
			util.addEvent(inputBox, "keyup", function(key){
				if (key.shiftKey && !key.ctrlKey && !key.metaKey) {
					var keyCode = key.charCode || key.keyCode;
					// Character 13 is Enter
					if (keyCode === 13) {
						doClick(command.autoindent);
					}
				}
			});
			
			if (!createEditor()) {
				creationHandle = self.setInterval(function(){
					if (createEditor()) {
						self.clearInterval(creationHandle);
					}
				}, 100);
			}
			
			util.addEvent(self, "resize", setDimensions);
			if (inputBox.form) {
				var submitCallback = inputBox.form.onsubmit;
				inputBox.form.onsubmit = function(){
					convertToHtml();
					if (submitCallback) {
						return submitCallback.apply(this, arguments);
					}
				};
			}
			
			setupUndoRedo();
		};
		
		// Convert the contents of the input textarea to HTML in the output/preview panels.
		var convertToHtml = function(){
		
			if (wmd.showdown) {
				var markdownConverter = new wmd.showdown.converter();
			}
			var text = inputBox.value;
			
			var callback = function(){
				inputBox.value = text;
			};
			
			if (!/markdown/.test(wmd.wmd_env.output.toLowerCase())) {
				if (markdownConverter) {
					inputBox.value = markdownConverter.makeHtml(text);
					self.setTimeout(callback, 0);
				}
			}
			return true;
		};
		
		// Sets up the WMD help button at the upper right of the input area.
		var setupWmdButton = function(){
		
			var div = doc.createElement("div");
			div.unselectable = "on";
			var style = div.style;
			style.paddingRight = "15px";
			style.height = "100%";
			style.display = "block";
			style.position = "absolute";
			style.right = "0";
			
			var anchor = doc.createElement("a");
			anchor.href = "http://www.wmd-editor.com/";
			anchor.target = "_blank";
			anchor.title = "WMD: The Wysiwym Markdown Editor";
			style = anchor.style;
			style.position = "absolute";
			style.right = "10px";
			style.top = "5px";
			style.display = "inline";
			style.width = "50px";
			style.height = "25px";
			
			var normalImage = util.createImage("images/wmd.png");
			anchor.appendChild(normalImage);
			
			anchor.onmouseover = function(){
				util.setImage(normalImage, "images/wmd-on.png"); // The dark WMD
				anchor.style.cursor = "pointer";
			};
			anchor.onmouseout = function(){
				util.setImage(normalImage, "images/wmd.png"); // The light WMD
			};
			
			mainDiv.appendChild(anchor);
		};
		
		// Calculates and sets dimensions for the input region.
		// The button bar is inside the input region so it's complicated.
		var setDimensions = function(){
		
			if (!util.elementOk(inputBox)) {
				mainDiv.style.display = "none";
				return;
			}
			if (mainDiv.style.display == "none") {
				mainDiv.style.display = "block";
			}
			
			var inputWidth = position.getWidth(inputBox);
			var inputHeight = position.getHeight(inputBox);
			var inputLeft = position.getLeft(inputBox);
			
			// Check for resize.
			if (mainDiv.style.width == (inputWidth + "px") && (savedHeight == inputHeight) && (savedLeft == inputLeft)) {
				if (position.getTop(mainDiv) < position.getTop(inputBox)) {
					return;
				}
			}
			
			savedHeight = inputHeight;
			savedLeft = inputLeft;
			
			var minWidth = 100; // This could be calculated based on the width of the button bar.
			mainDiv.style.width = Math.max(inputWidth, minWidth) + "px";
			
			var root = mainDiv.offsetParent;
			
			var spanHeight = position.getHeight(mainSpan);
			var inputHeight = spanHeight - btnBarHeight + "px";
			mainDiv.style.height = inputHeight;
			
			if (util.fillers) {
				util.fillers[0].style.height = util.fillers[1].style.height = inputHeight;
			}
			
			var magicThreePx = 3; // Why do we pick 3?  Some sort of overlap to cover the border?
			inputBox.style.marginTop = spanHeight + magicThreePx + offsetHeight + "px";
			
			var inputTop = position.getTop(inputBox);
			inputLeft = position.getLeft(inputBox); // Originally redefined with var
			position.setTop(root, inputTop - spanHeight - magicThreePx);
			position.setLeft(root, inputLeft);
			
			mainDiv.style.opacity = mainDiv.style.opacity || 0.999;
			
			return;
		};
		
		this.undo = function(){
			if (undoMgr) {
				undoMgr.undo();
			}
		};
		
		this.redo = function(){
			if (undoMgr) {
				undoMgr.redo();
			}
		};
		
		// This is pretty useless.  The setupEditor function contents
		// should just be copied here.
		var init = function(){
			setupEditor();
		};
		
		this.destroy = function(){
			if (undoMgr) {
				undoMgr.destroy();
			}
			if (div.parentNode) {
				div.parentNode.removeChild(div);
			}
			if (inputBox) {
				inputBox.style.marginTop = "";
			}
			self.clearInterval(resizePollHandle);
			self.clearInterval(creationHandle);
		};
		
		init();
	};
	
	// DONE
	// The textarea state/contents.
	// This is only used to implement undo/redo by the undo manager.
	wmd.textareaState = function(inputArea){
	
		var stateObj = this;
		
		var setSelection = function(targetArea){
		
			if (!util.isVisible(inputArea)) {
				return;
			}
			
			var isOpera = nav.userAgent.indexOf("Opera") != -1;
			
			if (targetArea.selectionStart !== undefined && !isOpera) {
			
				targetArea.focus();
				targetArea.selectionStart = stateObj.start;
				targetArea.selectionEnd = stateObj.end;
				targetArea.scrollTop = stateObj.scrollTop;
				
			}
			else 
				if (doc.selection) {
				
					if (doc.activeElement && doc.activeElement !== inputArea) {
						return;
					}
					
					targetArea.focus();
					var range = targetArea.createTextRange();
					range.moveStart("character", -targetArea.value.length);
					range.moveEnd("character", -targetArea.value.length);
					range.moveEnd("character", stateObj.end);
					range.moveStart("character", stateObj.start);
					range.select();
				}
		};
		
		this.init = function(targetArea){
		
			// Normally the argument is not passed so the arguemnt passed to constructor
			// is used as the input area.
			if (targetArea) {
				inputArea = targetArea;
			}
			
			if (!util.isVisible(inputArea)) {
				return;
			}
			
			setStartEnd();
			stateObj.scrollTop = inputArea.scrollTop;
			if (!stateObj.text && inputArea.selectionStart || inputArea.selectionStart === 0) {
				stateObj.text = inputArea.value;
			}
		};
		
		var fixEolChars = function(text){
			text = text.replace(/\r\n/g, "\n");
			text = text.replace(/\r/g, "\n");
			return text;
		};
		
		var setStartEnd = function(){
		
			if (inputArea.selectionStart || inputArea.selectionStart === 0) {
			
				stateObj.start = inputArea.selectionStart;
				stateObj.end = inputArea.selectionEnd;
			}
			else 
				if (doc.selection) {
				
					stateObj.text = fixEolChars(inputArea.value);
					
					var range = doc.selection.createRange(); // The currently selected text.
					var fixedRange = fixEolChars(range.text); // The currently selected text with regular newlines.
					var marker = "\x07"; // A marker for the selected text.
					var markedRange = marker + fixedRange + marker; // Surround the selection with a marker.
					range.text = markedRange; // Change the selection text to marked up range.
					var inputText = fixEolChars(inputArea.value);
					
					range.moveStart("character", -markedRange.length); // Move the selection start back to the beginning of the marked up text.
					range.text = fixedRange; // And substitute the text with the fixed newlines.
					// Start and End refer to the marked up region.
					stateObj.start = inputText.indexOf(marker);
					stateObj.end = inputText.lastIndexOf(marker) - marker.length;
					
					var len = stateObj.text.length - fixEolChars(inputArea.value).length;
					
					if (len) {
						range.moveStart("character", -fixedRange.length);
						while (len--) {
							fixedRange += "\n";
							stateObj.end += 1;
						}
						range.text = fixedRange;
					}
					
					setSelection(inputArea);
				}
			
			
			return stateObj;
		};
		
		// Restore this state into the input area.
		this.restore = function(targetArea){
		
			// The target area argument is never used so it will always
			// be the inputArea.
			if (!targetArea) {
				targetArea = inputArea;
			}
			if (stateObj.text != undefined && stateObj.text != targetArea.value) {
				targetArea.value = stateObj.text;
			}
			setSelection(targetArea);
			targetArea.scrollTop = stateObj.scrollTop;
		};
		
		// Gets a collection of HTML chunks from the inptut textarea.
		this.getChunks = function(){
		
			var chunk = new wmd.Chunks();
			
			chunk.before = fixEolChars(stateObj.text.substring(0, stateObj.start));
			chunk.startTag = "";
			chunk.selection = fixEolChars(stateObj.text.substring(stateObj.start, stateObj.end));
			chunk.endTag = "";
			chunk.after = fixEolChars(stateObj.text.substring(stateObj.end));
			chunk.scrollTop = stateObj.scrollTop;
			
			return chunk;
		};
		
		this.setChunks = function(chunk){
		
			chunk.before = chunk.before + chunk.startTag;
			chunk.after = chunk.endTag + chunk.after;
			
			var isOpera = nav.userAgent.indexOf("Opera") !== -1;
			if (isOpera) {
				chunk.before = chunk.before.replace(/\n/g, "\r\n");
				chunk.selection = chunk.selection.replace(/\n/g, "\r\n");
				chunk.after = chunk.after.replace(/\n/g, "\r\n");
			}
			
			stateObj.start = chunk.before.length;
			stateObj.end = chunk.before.length + chunk.selection.length;
			stateObj.text = chunk.before + chunk.selection + chunk.after;
			stateObj.scrollTop = chunk.scrollTop;
		};
		
		this.init();
	};
	
	// DONE - empty
	//
	// before: contains all the text in the input box BEFORE the selection.
	// after: contains all the text in the input box AFTER the selection.
	wmd.Chunks = function(){
	};
	
	// startRegex: a regular expression to find the start tag
	// endRegex: a regular expresssion to find the end tag
	wmd.Chunks.prototype.findTags = function(startRegex, endRegex){
	
		var chunkObj = this;
		var regex;
		
		if (startRegex) {
			
			regex = util.extendRegExp(startRegex, "", "$");
			
			this.before = this.before.replace(regex, 
				function(match){
					chunkObj.startTag = chunkObj.startTag + match;
					return "";
				});
			
			regex = util.extendRegExp(startRegex, "^", "");
			
			this.selection = this.selection.replace(regex, 
				function(match){
					chunkObj.startTag = chunkObj.startTag + match;
					return "";
				});
		}
		
		if (endRegex) {
			
			regex = util.extendRegExp(endRegex, "", "$");
			
			this.selection = this.selection.replace(regex,
				function(match){
					chunkObj.endTag = match + chunkObj.endTag;
					return "";
				});

			regex = util.extendRegExp(endRegex, "^", "");
			
			this.after = this.after.replace(regex,
				function(match){
					chunkObj.endTag = match + chunkObj.endTag;
					return "";
				});
		}
	};
	
	// DONE - jslint clean
	//
	// If the argument is false, the whitespace is transferred
	// to the before/after borders.
	// If the argument is true, the whitespace disappears.
	//
	// The double negative sucks.  The paramater "sign" needs to be flipped
	// or the variable eliminated.
	wmd.Chunks.prototype.trimWhitespace = function(dontMove){
	
		this.selection = this.selection.replace(/^(\s*)/, "");
		
		if (!dontMove) {
			this.before += re.$1;
		}
		
		this.selection = this.selection.replace(/(\s*)$/, "");
		
		if (!dontMove) {
			this.after = re.$1 + this.after;
		}
	};
	
	
	wmd.Chunks.prototype.skipLines = function(nLinesBefore, nLinesAfter, findExtraNewlines){
	
		if (nLinesBefore === undefined) {
			nLinesBefore = 1;
		}
		
		if (nLinesAfter === undefined) {
			nLinesAfter = 1;
		}
		
		nLinesBefore++;
		nLinesAfter++;
		
		var regexText;
		var replacementText;
		
		this.selection = this.selection.replace(/(^\n*)/, "");
		this.startTag = this.startTag + re.$1;
		this.selection = this.selection.replace(/(\n*$)/, "");
		this.endTag = this.endTag + re.$1;
		this.startTag = this.startTag.replace(/(^\n*)/, "");
		this.before = this.before + re.$1;
		this.endTag = this.endTag.replace(/(\n*$)/, "");
		this.after = this.after + re.$1;
		
		if (this.before) {
		
			regexText = replacementText = "";
			
			while (nLinesBefore--) {
				regexText += "\\n?";
				replacementText += "\n";
			}
			
			if (findExtraNewlines) {
				regexText = "\\n*";
			}
			this.before = this.before.replace(new re(regexText + "$", ""), replacementText);
		}
		
		if (this.after) {
		
			regexText = replacementText = "";
			
			while (nLinesAfter--) {
				regexText += "\\n?";
				replacementText += "\n";
			}
			if (findExtraNewlines) {
				regexText = "\\n*";
			}
			
			this.after = this.after.replace(new re(regexText, ""), replacementText);
		}
	};
	
	// The markdown symbols - 4 spaces = code, > = blockquote, etc.
	command.prefixes = "(?:\\s{4,}|\\s*>|\\s*-\\s+|\\s*\\d+\\.|=|\\+|-|_|\\*|#|\\s*\\[[^\n]]+\\]:)";
	
	// Remove markdown symbols from the chunk selection.
	command.unwrap = function(chunk){
		var txt = new re("([^\\n])\\n(?!(\\n|" + command.prefixes + "))", "g");
		chunk.selection = chunk.selection.replace(txt, "$1 $2");
	};
	
	command.wrap = function(chunk, len){
		command.unwrap(chunk);
		var regex = new re("(.{1," + len + "})( +|$\\n?)", "gm");
		
		chunk.selection = chunk.selection.replace(regex, function(line, marked){
			if (new re("^" + command.prefixes, "").test(line)) {
				return line;
			}
			return marked + "\n";
		});
		
		chunk.selection = chunk.selection.replace(/\s+$/, "");
	};
	
	command.doBold = function(chunk){
		return command.doBorI(chunk, 2, "strong text");
	};
	
	command.doItalic = function(chunk){
		return command.doBorI(chunk, 1, "emphasized text");
	};
	
	// DONE - reworked a little and jslint clean
	//
	// chunk: The selected region that will be enclosed with */**
	// nStars: 1 for italics, 2 for bold
	// insertText: If you just click the button without highlighting text, this gets inserted
	//
	// This part of the control acts in some pretty weird ways.
	command.doBorI = function(chunk, nStars, insertText){
	
		// Get rid of whitespace and fixup newlines.
		chunk.trimWhitespace();
		chunk.selection = chunk.selection.replace(/\n{2,}/g, "\n");
		
		// Look for stars before and after.  Is the chunk already marked up?
		chunk.before.search(/(\**$)/);
		var starsBefore = re.$1;
		
		chunk.after.search(/(^\**)/);
		var starsAfter = re.$1;
		
		var prevStars = Math.min(starsBefore.length, starsAfter.length);
		
		// Remove stars if we have to since the button acts as a toggle.
		if ((prevStars >= nStars) && (prevStars != 2 || nStars != 1)) {
			chunk.before = chunk.before.replace(re("[*]{" + nStars + "}$", ""), "");
			chunk.after = chunk.after.replace(re("^[*]{" + nStars + "}", ""), "");
			return;
		}
		
		// It's not really clear why this code is necessary.  It just moves
		// some arbitrary stuff around.
		if (!chunk.selection && starsAfter) {
			chunk.after = chunk.after.replace(/^([*_]*)/, "");
			chunk.before = chunk.before.replace(/(\s?)$/, "");
			var whitespace = re.$1;
			chunk.before = chunk.before + starsAfter + whitespace;
			return;
		}
		
		// In most cases, if you don't have any selected text and click the button
		// you'll get a selected, marked up region with the default text inserted.
		if (!chunk.selection && !starsAfter) {
			chunk.selection = insertText;
		}
		
		// Add the true markup.
		var markup = nStars <= 1 ? "*" : "**"; // shouldn't the test be = ?
		chunk.before = chunk.before + markup;
		chunk.after = markup + chunk.after;
	};
	
	// DONE
	command.stripLinkDefs = function(text, defsToAdd){
	
		text = text.replace(/^[ ]{0,3}\[(\d+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|$)/gm, 
			function(totalMatch, id, link, newlines, title){	
				defsToAdd[id] = totalMatch.replace(/\s*$/, "");
				if (newlines) {
					// Strip the title and return that separately.
					defsToAdd[id] = totalMatch.replace(/["(](.+?)[")]$/, "");
					return newlines + title;
				}
				return "";
			});
		
		return text;
	};
	
	// DONE
	command.addLinkDef = function(chunk, linkDef){
	
		var refNumber = 0; // The current reference number
		var defsToAdd = {}; //
		// Start with a clean slate by removing all previous link definitions.
		chunk.before = command.stripLinkDefs(chunk.before, defsToAdd);
		chunk.selection = command.stripLinkDefs(chunk.selection, defsToAdd);
		chunk.after = command.stripLinkDefs(chunk.after, defsToAdd);
		
		var defs = "";
		var regex = /(\[(?:\[[^\]]*\]|[^\[\]])*\][ ]?(?:\n[ ]*)?\[)(\d+)(\])/g;
		
		var addDefNumber = function(def){
			refNumber++;
			def = def.replace(/^[ ]{0,3}\[(\d+)\]:/, "  [" + refNumber + "]:");
			defs += "\n" + def;
		};
		
		var getLink = function(wholeMatch, link, id, end){
		
			if (defsToAdd[id]) {
				addDefNumber(defsToAdd[id]);
				return link + refNumber + end;
				
			}
			return wholeMatch;
		};
		
		chunk.before = chunk.before.replace(regex, getLink);
		
		if (linkDef) {
			addDefNumber(linkDef);
		}
		else {
			chunk.selection = chunk.selection.replace(regex, getLink);
		}
		
		var refOut = refNumber;
		
		chunk.after = chunk.after.replace(regex, getLink);
		
		if (chunk.after) {
			chunk.after = chunk.after.replace(/\n*$/, "");
		}
		if (!chunk.after) {
			chunk.selection = chunk.selection.replace(/\n*$/, "");
		}
		
		chunk.after += "\n\n" + defs;
		
		return refOut;
	};
	
	// Done
	command.doLinkOrImage = function(chunk, isImage, performAction){
	
		chunk.trimWhitespace();
		chunk.findTags(/\s*!?\[/, /\][ ]?(?:\n[ ]*)?(\[.*?\])?/);
		
		if (chunk.endTag.length > 1) {
		
			chunk.startTag = chunk.startTag.replace(/!?\[/, "");
			chunk.endTag = "";
			command.addLinkDef(chunk, null);
			
		}
		else {
		
			if (/\n\n/.test(chunk.selection)) {
				command.addLinkDef(chunk, null);
				return;
			}
			
			var promptForm;
			
			// The function to be executed when you enter a link and press OK or Cancel.
			// Marks up the link and adds the ref.
			var callback = function(link){
			
				if (link !== null) {
				
					chunk.startTag = chunk.endTag = "";
					var linkDef = " [999]: " + link;
					
					var num = command.addLinkDef(chunk, linkDef);
					chunk.startTag = isImage ? "![" : "[";
					chunk.endTag = "][" + num + "]";
					
					if (!chunk.selection) {
						if (isImage) {
							chunk.selection = "alt text";
						}
						else {
							chunk.selection = "link text";
						}
					}
				}
				performAction();
			};
			
			if (isImage) {
				promptForm = util.prompt(imageDialogText, imageDefaultText, callback);
			}
			else {
				promptForm = util.prompt(linkDialogText, linkDefaultText, callback);
			}
			return true;
		}
	};
	

	// DONE - jslint clean
	util.findPanels = function(){
	
		var wmdPanels = {};
			
		wmdPanels.buttonBar = doc.getElementById("wmd-button-bar");
		wmdPanels.preview = doc.getElementById("wmd-preview");
		wmdPanels.output = doc.getElementById("wmd-output");
		wmdPanels.input = doc.getElementById("wmd-input");
		
		return wmdPanels;
	};
	
	// DONE - jslint clean
	util.makeAPI = function(){
		wmd.wmd = {};
		wmd.wmd.editor = wmd.editor;
		wmd.wmd.previewManager = wmd.previewManager;
	};
	
	// DONE - fixed up and jslint clean
	util.startEditor = function(){
	
	    var ignored = null;
	
		if (wmd.wmd_env.autostart === false) {
			util.makeAPI();
			return;
		}
		
		// wmdStuff is just an empty object that we'll fill with references
		// to the various important parts of the library.  e.g. the 
		// input and output textareas/divs.
		var wmdStuff;
		var edit, preview;
		
		// Fired after the page has fully loaded.
		var loadListener = function(){
		
			try {
				// I think the clone equality test is just a strange way to see
				// if the panes got set/reset in findPanes().
				var clone = util.cloneObject(wmdStuff);
				wmdStuff = util.findPanels();
				
				if (!util.objectsEqual(clone, wmdStuff) && wmdStuff.input) {
				
					if (!edit) {
					
						var previewRefreshCallback;
						
						if (wmd.previewManager !== undefined) {
							preview = new wmd.previewManager(wmdStuff);
							previewRefreshCallback = preview.refresh;
						}
						
						edit = new wmd.editor(wmdStuff.input, previewRefreshCallback);
						clearInterval(ignored);
					}
					else 
						if (preview) {
							preview.refresh(true);
						}
				}
			} 
			catch (e) {
				// Useful!
			}
			
		};
		
		util.addEvent(self, "load", loadListener);
		ignored = self.setInterval(loadListener, 100);
	};
	
	// DONE
	wmd.previewManager = function(wmdStuff){
	
		// wmdStuff stores random things we need to keep track of, like
		// the input textarea.	
		
		var managerObj = this;
		var converter;
		var timeout;
		var elapsedTime;
		var oldInputText;
		var htmlOut;
		var maxDelay = 3000;
		var startType = "delayed"; // The other legal value is "manual"
		// Adds event listeners to elements and creates the input poller.
		var setupEvents = function(inputElem, listener){
		
			util.addEvent(inputElem, "input", listener);
			inputElem.onpaste = listener;
			inputElem.ondrop = listener;
			
			util.addEvent(inputElem, "keypress", listener);
			util.addEvent(inputElem, "keydown", listener);
		};
		
		var getDocScrollTop = function(){
		
			var result = 0;
			
			if (self.innerHeight) {
				result = self.pageYOffset;
			}
			else 
				if (doc.documentElement && doc.documentElement.scrollTop) {
					result = doc.documentElement.scrollTop;
				}
				else 
					if (doc.body) {
						result = doc.body.scrollTop;
					}
			
			return result;
		};
		
		var makePreviewHtml = function(){
		
			// If there are no registered preview and output panels
			// there is nothing to do.
			if (!wmdStuff.preview && !wmdStuff.output) {
				return;
			}
			
			var text = wmdStuff.input.value;
			if (text && text == oldInputText) {
				return; // Input text hasn't changed.
			}
			else {
				oldInputText = text;
			}
			
			var prevTime = new Date().getTime();
			
			if (!converter && wmd.showdown) {
				converter = new wmd.showdown.converter();
			}
			
			if (converter) {
				text = converter.makeHtml(text);
			}
			
			// Calculate the processing time of the HTML creation.
			// It's used as the delay time in the event listener.
			var currTime = new Date().getTime();
			elapsedTime = currTime - prevTime;
			
			pushPreviewHtml(text);
			htmlOut = text;
		};
		
		// setTimeout is already used.  Used as an event listener.
		var applyTimeout = function(){
		
			if (timeout) {
				self.clearTimeout(timeout);
				timeout = undefined;
			}
			
			if (startType !== "manual") {
			
				var delay = 0;
				
				if (startType === "delayed") {
					delay = elapsedTime;
				}
				
				if (delay > maxDelay) {
					delay = maxDelay;
				}
				timeout = self.setTimeout(makePreviewHtml, delay);
			}
		};
		
		var getScaleFactor = function(panel){
			if (panel.scrollHeight <= panel.clientHeight) {
				return 1;
			}
			return panel.scrollTop / (panel.scrollHeight - panel.clientHeight);
		};
		
		var setPanelScrollTops = function(){
		
			if (wmdStuff.preview) {
				wmdStuff.preview.scrollTop = (wmdStuff.preview.scrollHeight - wmdStuff.preview.clientHeight) * getScaleFactor(wmdStuff.preview);
				;
			}
			
			if (wmdStuff.output) {
				wmdStuff.output.scrollTop = (wmdStuff.output.scrollHeight - wmdStuff.output.clientHeight) * getScaleFactor(wmdStuff.output);
				;
			}
		};
		
		this.refresh = function(requiresRefresh){
		
			if (requiresRefresh) {
				oldInputText = "";
				makePreviewHtml();
			}
			else {
				applyTimeout();
			}
		};
		
		this.processingTime = function(){
			return elapsedTime;
		};
		
		// The output HTML
		this.output = function(){
			return htmlOut;
		};
		
		// The mode can be "manual" or "delayed"
		this.setUpdateMode = function(mode){
			startType = mode;
			managerObj.refresh();
		};
		
		var isFirstTimeFilled = true;
		
		var pushPreviewHtml = function(text){
		
			var emptyTop = position.getTop(wmdStuff.input) - getDocScrollTop();
			
			// Send the encoded HTML to the output textarea/div.
			if (wmdStuff.output) {
				// The value property is only defined if the output is a textarea.
				if (wmdStuff.output.value !== undefined) {
					wmdStuff.output.value = text;
					wmdStuff.output.readOnly = true;
				}
				// Otherwise we are just replacing the text in a div.
				// Send the HTML wrapped in <pre><code>
				else {
					var newText = text.replace(/&/g, "&amp;");
					newText = newText.replace(/</g, "&lt;");
					wmdStuff.output.innerHTML = "<pre><code>" + newText + "</code></pre>";
				}
			}
			
			if (wmdStuff.preview) {
				wmdStuff.preview.innerHTML = text;
			}
			
			setPanelScrollTops();
			
			if (isFirstTimeFilled) {
				isFirstTimeFilled = false;
				return;
			}
			
			var fullTop = position.getTop(wmdStuff.input) - getDocScrollTop();
			
			if (nav.userAgent.indexOf("MSIE") != -1) {
				self.setTimeout(function(){
					self.scrollBy(0, fullTop - emptyTop);
				}, 0);
			}
			else {
				self.scrollBy(0, fullTop - emptyTop);
			}
		};
		
		var init = function(){
		
			setupEvents(wmdStuff.input, applyTimeout);
			makePreviewHtml();
			
			if (wmdStuff.preview) {
				wmdStuff.preview.scrollTop = 0;
			}
			if (wmdStuff.output) {
				wmdStuff.output.scrollTop = 0;
			}
		};
		
		this.destroy = function(){
		};
		
		init();
	};

	// When making a list, hitting shift-enter will put your cursor on the next line
	// at the current indent level.
	command.doAutoindent = function(chunk){
		
		chunk.before = chunk.before.replace(/(\n|^)[ ]{0,3}([*+-]|\d+[.])[ \t]*\n$/, "\n\n");
		chunk.before = chunk.before.replace(/(\n|^)[ ]{0,3}>[ \t]*\n$/, "\n\n");
		chunk.before = chunk.before.replace(/(\n|^)[ \t]+\n$/, "\n\n");
		
		if(/(\n|^)[ ]{0,3}([*+-]|\d+[.])[ \t]+.*\n$/.test(chunk.before)){
			if(command.doList){
				command.doList(chunk);
			}
		}
		if(/(\n|^)[ ]{0,3}>[ \t]+.*\n$/.test(chunk.before)){
			if(command.doBlockquote){
				command.doBlockquote(chunk);
			}
		}
		if(/(\n|^)(\t|[ ]{4,}).*\n$/.test(chunk.before)){
			if(command.doCode){
				command.doCode(chunk);
			}
		}
	};
	
	// DONE
	command.doBlockquote = function(chunk){
		
		chunk.selection = chunk.selection.replace(/^(\n*)([^\r]+?)(\n*)$/,
			function(totalMatch, newlinesBefore, text, newlinesAfter){
				chunk.before += newlinesBefore;
				chunk.after = newlinesAfter + chunk.after;
				return text;
			});
			
		chunk.before = chunk.before.replace(/(>[ \t]*)$/,
			function(totalMatch, blankLine){
				chunk.selection = blankLine + chunk.selection;
				return "";
			});
			
		chunk.selection = chunk.selection.replace(/^(\s|>)+$/ ,"");
		chunk.selection = chunk.selection || "Blockquote";
		
		if(chunk.before){
			chunk.before = chunk.before.replace(/\n?$/,"\n");
		}
		if(chunk.after){
			chunk.after = chunk.after.replace(/^\n?/,"\n");
		}
		
		chunk.before = chunk.before.replace(/(((\n|^)(\n[ \t]*)*>(.+\n)*.*)+(\n[ \t]*)*$)/,
			function(totalMatch){
				chunk.startTag = totalMatch;
				return "";
			});
			
		chunk.after = chunk.after.replace(/^(((\n|^)(\n[ \t]*)*>(.+\n)*.*)+(\n[ \t]*)*)/,
			function(totalMatch){
				chunk.endTag = totalMatch;
				return "";
			});
		
		var replaceBlanksInTags = function(useBracket){
			
			var replacement = useBracket ? "> " : "";
			
			if(chunk.startTag){
				chunk.startTag = chunk.startTag.replace(/\n((>|\s)*)\n$/,
					function(totalMatch, markdown){
						return "\n" + markdown.replace(/^[ ]{0,3}>?[ \t]*$/gm, replacement) + "\n";
					});
			}
			if(chunk.endTag){
				chunk.endTag = chunk.endTag.replace(/^\n((>|\s)*)\n/,
					function(totalMatch, markdown){
						return "\n" + markdown.replace(/^[ ]{0,3}>?[ \t]*$/gm, replacement) + "\n";
					});
			}
		};
		
		if(/^(?![ ]{0,3}>)/m.test(chunk.selection)){
			command.wrap(chunk, wmd.wmd_env.lineLength - 2);
			chunk.selection = chunk.selection.replace(/^/gm, "> ");
			replaceBlanksInTags(true);
			chunk.skipLines();
		}
		else{
			chunk.selection = chunk.selection.replace(/^[ ]{0,3}> ?/gm, "");
			command.unwrap(chunk);
			replaceBlanksInTags(false);
			
			if(!/^(\n|^)[ ]{0,3}>/.test(chunk.selection) && chunk.startTag){
				chunk.startTag = chunk.startTag.replace(/\n{0,2}$/, "\n\n");
			}
			
			if(!/(\n|^)[ ]{0,3}>.*$/.test(chunk.selection) && chunk.endTag){
				chunk.endTag=chunk.endTag.replace(/^\n{0,2}/, "\n\n");
			}
		}
		
		if(!/\n/.test(chunk.selection)){
			chunk.selection = chunk.selection.replace(/^(> *)/,
			function(wholeMatch, blanks){
				chunk.startTag += blanks;
				return "";
			});
		}
	};

	// DONE
	command.doCode = function(chunk){
		
		var hasTextBefore = /\S[ ]*$/.test(chunk.before);
		var hasTextAfter = /^[ ]*\S/.test(chunk.after);
		
		// Use 'four space' markdown if the selection is on its own
		// line or is multiline.
		if((!hasTextAfter && !hasTextBefore) || /\n/.test(chunk.selection)){
			
			chunk.before = chunk.before.replace(/[ ]{4}$/,
				function(totalMatch){
					chunk.selection = totalMatch + chunk.selection;
					return "";
				});
				
			var nLinesBack = 1;
			var nLinesForward = 1;
			
			if(/\n(\t|[ ]{4,}).*\n$/.test(chunk.before)){
				nLinesBack = 0;
			}
			if(/^\n(\t|[ ]{4,})/.test(chunk.after)){
				nLinesForward = 0;
			}
			
			chunk.skipLines(nLinesBack, nLinesForward);
			
			if(!chunk.selection){
				chunk.startTag = "    ";
				chunk.selection = "enter code here";
				return;
			}
			
			if(/^[ ]{0,3}\S/m.test(chunk.selection)){
				chunk.selection = chunk.selection.replace(/^/gm, "    ");
			}
			else{
				chunk.selection = chunk.selection.replace(/^[ ]{4}/gm, "");
			}
		}
		else{
			
			// Use backticks (`) to delimit the code block.
			
			chunk.trimWhitespace();
			chunk.findTags(/`/,/`/);
			
			if(!chunk.startTag && !chunk.endTag){
				chunk.startTag = chunk.endTag="`";
				if(!chunk.selection){
					chunk.selection = "enter code here";
				}
			}
			else if(chunk.endTag && !chunk.startTag){
				chunk.before += chunk.endTag;
				chunk.endTag = "";
			}
			else{
				chunk.startTag = chunk.endTag="";
			}
		}
	};
	
	// List processing callback.
	//
	// isNumberedList will be undefined if we're reprocessing the list and
	// this function gets called internally, outside of a button click.
	command.doList = function(chunk, isNumberedList){
				
		// These are identical except at the very beginning and end.
		// Should probably use the regex extension function to make this clearer.
		var previousItemsRegex = /(\n|^)(([ ]{0,3}([*+-]|\d+[.])[ \t]+.*)(\n.+|\n{2,}([*+-].*|\d+[.])[ \t]+.*|\n{2,}[ \t]+\S.*)*)\n*$/;
		var nextItemsRegex = /^\n*(([ ]{0,3}([*+-]|\d+[.])[ \t]+.*)(\n.+|\n{2,}([*+-].*|\d+[.])[ \t]+.*|\n{2,}[ \t]+\S.*)*)\n*/;
		
		// The default bullet is a dash but others are possible.
		// This has nothing to do with the particular HTML bullet,
		// it's just a markdown bullet.
		var bullet = "-";
		
		// The number in a numbered list.
		var num = 1;
		
		// Get the item prefix - e.g. " 1. " for a numbered list, " - " for a bulleted list.
		var getItemPrefix = function(){
			var prefix;
			if(isNumberedList){
				prefix = " " + num + ". ";
				num++;
			}
			else{
				prefix = " " + bullet + " ";
			}
			return prefix;
		};
		
		// Fixes the prefixes of the other list items.
		var getPrefixedItem = function(itemText){
		
			// The numbering flag is unset when called internally.
			if(isNumberedList === undefined){
				isNumberedList = /^\s*\d/.test(itemText);
			}
			
			// Renumber/bullet the list element.
			itemText = itemText.replace(/^[ ]{0,3}([*+-]|\d+[.])\s/gm,
				function( _ ){
					return getItemPrefix();
				});
				
			return itemText;
		};
		
		chunk.findTags(/(\n|^)*[ ]{0,3}([*+-]|\d+[.])\s+/, null);
		
		if(chunk.before && !/\n$/.test(chunk.before) && !/^\n/.test(chunk.startTag)){
			chunk.before += chunk.startTag;
			chunk.startTag = "";
		}
		
		if(chunk.startTag){
			
			var hasDigits = /\d+[.]/.test(chunk.startTag);
			chunk.startTag = "";
			chunk.selection = chunk.selection.replace(/\n[ ]{4}/g, "\n");
			command.unwrap(chunk);
			chunk.skipLines();
			
			if(hasDigits){
				// Have to renumber the bullet points if this is a numbered list.
				chunk.after = chunk.after.replace(nextItemsRegex, getPrefixedItem);
			}
			if(isNumberedList == hasDigits){
				return;
			}
		}
		
		var nLinesUp = 1;
		
		chunk.before = chunk.before.replace(previousItemsRegex,
			function(itemText){
				if(/^\s*([*+-])/.test(itemText)){
					bullet = re.$1;
				}
				nLinesUp = /[^\n]\n\n[^\n]/.test(itemText) ? 1 : 0;
				return getPrefixedItem(itemText);
			});
			
		if(!chunk.selection){
			chunk.selection = "List item";
		}
		
		var prefix = getItemPrefix();
		
		var nLinesDown = 1;
		
		chunk.after = chunk.after.replace(nextItemsRegex,
			function(itemText){
				nLinesDown = /[^\n]\n\n[^\n]/.test(itemText) ? 1 : 0;
				return getPrefixedItem(itemText);
			});
			
		chunk.trimWhitespace(true);
		chunk.skipLines(nLinesUp, nLinesDown, true);
		chunk.startTag = prefix;
		var spaces = prefix.replace(/./g, " ");
		command.wrap(chunk, wmd.wmd_env.lineLength - spaces.length);
		chunk.selection = chunk.selection.replace(/\n/g, "\n" + spaces);
	};
	
	// DONE
	command.doHeading = function(chunk){
		
		// Remove leading/trailing whitespace and reduce internal spaces to single spaces.
		chunk.selection = chunk.selection.replace(/\s+/g, " ");
		chunk.selection = chunk.selection.replace(/(^\s+|\s+$)/g, "");
		
		// If we clicked the button with no selected text, we just
		// make a level 2 hash header around some default text.
		if(!chunk.selection){
			chunk.startTag = "## ";
			chunk.selection = "Heading";
			chunk.endTag = " ##";
			return;
		}
		
		var headerLevel = 0;		// The existing header level of the selected text.
		
		// Remove any existing hash heading markdown and save the header level.
		chunk.findTags(/#+[ ]*/, /[ ]*#+/);
		if(/#+/.test(chunk.startTag)){
			headerLevel = re.lastMatch.length;
		}
		chunk.startTag = chunk.endTag = "";
		
		// Try to get the current header level by looking for - and = in the line
		// below the selection.
		chunk.findTags(null, /\s?(-+|=+)/);
		if(/=+/.test(chunk.endTag)){
			headerLevel = 1;
		}
		if(/-+/.test(chunk.endTag)){
			headerLevel = 2;
		}
		
		// Skip to the next line so we can create the header markdown.
		chunk.startTag = chunk.endTag = "";
		chunk.skipLines(1, 1);

		// We make a level 2 header if there is no current header.
		// If there is a header level, we substract one from the header level.
		// If it's already a level 1 header, it's removed.
		var headerLevelToCreate = headerLevel == 0 ? 2 : headerLevel - 1;
		
		if(headerLevelToCreate > 0){
			
			// The button only creates level 1 and 2 underline headers.
			// Why not have it iterate over hash header levels?  Wouldn't that be easier and cleaner?
			var headerChar = headerLevelToCreate >= 2 ? "-" : "=";
			var len = chunk.selection.length;
			if(len > wmd.wmd_env.lineLength){
				len = wmd.wmd_env.lineLength;
			}
			chunk.endTag = "\n";
			while(len--){
				chunk.endTag += headerChar;
			}
		}
	};	
	
	// Note that these commands either have a textOp callback which is executed on button
	// click OR they have an execute function which performs non-text work.
	
	command.bold = {};
	command.bold.description = "Strong <strong>";
	command.bold.image = "images/bold.png";
	command.bold.key = "b";
	command.bold.textOp = command.doBold;
	
	command.italic = {};
	command.italic.description = "Emphasis <em>";
	command.italic.image = "images/italic.png";
	command.italic.key = "i";
	command.italic.textOp = command.doItalic;
	
	command.link = {};
	command.link.description = "Hyperlink <a>";
	command.link.image = "images/link.png";
	command.link.key = "l";
	command.link.textOp = function(chunk, callback){
		return command.doLinkOrImage(chunk, false, callback);
	};
	
	command.undo = {};
	command.undo.description = "Undo";
	command.undo.image = "images/undo.png";
	command.undo.execute = function(manager){
		manager.undo();
	};
	
	command.redo = {};
	command.redo.description = "Redo";
	command.redo.image = "images/redo.png";
	command.redo.execute = function(manager){
		manager.redo();
	};	
	
	command.autoindent={};
	command.autoindent.textOp = command.doAutoindent;
	
	command.blockquote = {};
	command.blockquote.description = "Blockquote <blockquote>";
	command.blockquote.image = "images/blockquote.png";
	command.blockquote.key = ".";
	command.blockquote.textOp = function(chunk){
		return command.doBlockquote(chunk);
	};
	
	command.code = {};
	command.code.description = "Code Sample <pre><code>";
	command.code.image = "images/code.png";
	command.code.key = "k";
	command.code.textOp = command.doCode;
	
	command.img = {};
	command.img.description = "Image <img>";
	command.img.image = "images/img.png";
	command.img.key = "g";
	command.img.textOp = function(chunk, callback){
		return command.doLinkOrImage(chunk, true, callback);
	};
	
	command.ol = {};
	command.ol.description = "Numbered List <ol>";
	command.ol.image = "images/ol.png";
	command.ol.key = "o";
	command.ol.textOp = function(chunk){
		command.doList(chunk, true);
	};
	
	command.ul = {};
	command.ul.description = "Bulleted List <ul>";
	command.ul.image = "images/ul.png";
	command.ul.key = "u";
	command.ul.textOp = function(chunk){
		command.doList(chunk, false);
	};
	
	command.h1 = {};
	command.h1.description = "Heading <h1>/<h2>";
	command.h1.image = "images/h1.png";
	command.h1.key = "h";
	command.h1.textOp = command.doHeading;
	
	command.hr = {};
	command.hr.description = "Horizontal Rule <hr>";
	command.hr.image = "images/hr.png";
	command.hr.key = "r";
	command.hr.textOp = function(chunk){	
		chunk.startTag = "----------\n";
		chunk.selection = "";
		chunk.skipLines(2, 1, true);
	};
};


Attacklab.wmd_env = {};
Attacklab.account_options = {};
Attacklab.wmd_defaults = {version:1, output:"HTML", lineLength:40, delayLoad:false};

if(!Attacklab.wmd)
{
	Attacklab.wmd = function()
	{
		Attacklab.loadEnv = function()
		{
			var mergeEnv = function(env)
			{
				if(!env)
				{
					return;
				}
			
				for(var key in env)
				{
					Attacklab.wmd_env[key] = env[key];
				}
			};
			
			mergeEnv(Attacklab.wmd_defaults);
			mergeEnv(Attacklab.account_options);
			mergeEnv(top["wmd_options"]);
			Attacklab.full = true;
			
			var defaultButtons = "bold italic | link blockquote code image | ol ul heading hr";
			Attacklab.wmd_env.buttons = Attacklab.wmd_env.buttons || defaultButtons;
		};
		Attacklab.loadEnv();
		
		var getPrefix = function(name)
		{
			var re = RegExp("(.*)" + name + "(\\?(.+))?$", "g");
			var elements = document.getElementsByTagName("script");
			
			for(var i = 0; i < elements.length; i++)
			{
				if(re.test(elements[i].src))
				{
					return RegExp.$1;
				}
			}
		};
		
		Attacklab.basePath = getPrefix("wmd.js");

	};
	
	Attacklab.wmd();
	Attacklab.wmdBase();
	Attacklab.Util.startEditor();
};

