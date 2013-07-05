chrome.tabs.query({
	'active': true
},
function(tabs) {
	var url = tabs[0].url;
	xhr.open('post', url, true);
	xhr.onreadystatechange = function() {
		var status = xhr.status;
		var tempCode;
		var html = '<h1>检查的URL:<textarea readonly>' + url + '</textarea></h1>';
		html += '<div><a href="view-source:' + url + '" target="_blank">查看当前页面源代码</a></div>';
		if (xhr.readyState == 4 && status >= 200 && status < 300 || status === 304 || status === 1223) {
			var msg = HTMLHint.verify(xhr.responseText, {
				'tag-pair': true,
				'attr-value-not-empty': true,
				'id-unique': true
			});
			tempCode = create(msg, url);
			html += tempCode;
			ndTarget.innerHTML = html;
			var ndError = document.querySelector('.J-error-list');
			if (ndError) {
				ndError.onclick = function(e) {
					var name = e.target.id;
					if (name == 'J-go-line') {
						var i = 0,
						x = '',
						w, line, ndError;
						w = window.open('', 'blank_' + (Math.random() * 1000000));
						x += '<head>'
						x += '<style>'
						x += 'body { font-size:12px; }'
						x += 'p,input,span ,html,body{ margin:0; padding:0; }'
						x += 'p { margin-left:40px; padding-left:10px; background:#FFF; border-left:1px solid #bcbcbc; }'
						x += 'div { position:relative; line-height:20px;  background:#f1f1f1; }'
						x += '.line-label { position:absolute; left:0px; display:inline-block; width:40px; padding:5px 5px 5px 0; margin-right:10px; border:none; cursor:default; text-align:right; background-color:#f1f1f1; color:#aca299; }'
						x += '.error-wrapper { background:#f1f1f1; }';
						x += '.error-wrapper input {  outline:none; }';
						x += '.error-wrapper p { background:#ffffc1; border-left:1px solid #ee5238;  }';
						x += '.error-wrapper input:focus { outline:10px; }';
						x += '.error-msg { color:red; }';
						x += '</style>'
						x += '</head>'
						x += '<body>'
						x += '<div>'
						x += xhr.responseText.replace(/(.*?)(\r?\n)/g, function(word) {
							i++;
							return '</div><div><input class="line-label" id="id_' + i + '" value="' + i + '"/><p>' + htmlEscape(word) + '</p>';
						});
						x += '</div>'
						x += '</body>'
						w.document.write(x);
						line = e.target.getAttribute('data-line');
						setTimeout(function() {
							var nd = w.document.getElementById('id_' + line),
                                ndMsg = document.createElement('p'),
                                ndParent = nd.parentNode;
                            if (nd) {
                                w.scrollTo(0, nd.offsetTop - 10);
                                addClass(ndParent, 'error-wrapper');
                                addClass(ndParent, 'error-wrapper-color');
                                ndMsg.innerHTML = 'Error Info: <strong>' + htmlEscape(e.target.getAttribute('data-msg')) + '</strong>';
                                ndMsg.className = 'error-msg';
                                ndParent.appendChild(ndMsg);
                                nd.focus();
                            }
						}, 100);
						function htmlEscape(text) {
							return text.replace(/[<>"&]/g, function(match, pos, orginalText) {
								switch (match) {
								case "<":
									return "&lt;";
								case ">":
									return "&gt;";
								case "&":
									return "&amp;";
								case "\"":
									return "&quot;";
								}
							})
						}
					}
				};
			}

		} else if (xhr.readyState == 4) {
			ndTarget.innerHTML = html + '<h2 class="error">Error : <a href="http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html">Http Status Code</a> ' + xhr.status + '</h2>';
		}
	};
	xhr.send(null);
});
var ndTarget = document.getElementById('content');
var xhr = new XMLHttpRequest;
ndTarget.innerHTML = '检查中....';
$('J-code').onkeypress = function(e) {
	var code = e.keyCode;
	if (code === 13) {
		e.preventDefault();
		checkCode(this);
	}
};
$('J-check').onclick = function(e) {
	checkCode(this);
};
$('J-code').onclick = function(e) {
	e.stopPropagation();
	removeClass(this, 't1-folder');
};
document.body.onmouseup = function() {
	addClass($('J-code'), 't1-folder');
};
function removeClass(nd, name) {
	var c = nd.className;
	if (hasClass(nd, name)) {
		nd.className = c.replace(new RegExp('(?:^|\\s+)' + name + '(?:\\s+|$)'), ' ');
	}
}
function addClass(nd, name) {
	if (!hasClass(nd, name)) {
		nd.className = nd.className + ' ' + name;
	}
}
function hasClass(nd, name) {
	var c = nd.className;
	return new RegExp('(?:^|\\s+)' + name + '(?:\\s+|$)').test(c);
}
function checkCode(nd) {
	var html = '';
	nd.setAttribute('disabled', 'disabled');
	var msg = HTMLHint.verify($('J-code').value, {
		'tag-pair': true
	});
	html = create(msg);
	if (!html) {
		html = '<h2>代码正常</h2>';
	}
	ndTarget.innerHTML = html;
	nd.removeAttribute('disabled');
}
function $(id) {
	return document.getElementById(id);
}
function create(msg, url) {
	var html = '',
        isError = false;
	if (msg.length <= 0) {
		html += '<h2>一切正常</h2>';
		return html;
	}
	html += '<h3>Error List</h3>'
	html += '<ul class="J-error-list">';
    console.log(msg);
	for (var i = 0; i < msg.length; i++) {
		if (msg[i].type.toLowerCase() === 'error') {
            isError = true;
			html += '<li>';
			html += '<p>message:<textarea readonly>' + msg[i].message + '</textarea></p>';
			html += '<p>raw:<textarea readonly>' + msg[i].raw + '</textarea></p>';
			html += '<p>evidence:<textarea readonly>' + msg[i].evidence + '</textarea></p>';
			html += '<p>Line:  ' + msg[i].line + '<a data-msg="' + msg[i].message +'" data-line="' + msg[i].line + '" class="go-line" id="J-go-line" target="_blank" href="javascript:;">查看此错误行</a></p>';
			html += '<p>Col:  ' + msg[i].col + '</p>';
			html += '<p>rule:  ' + msg[i].rule.description + '</p>';
			html += '</li>';
		}
	}
	html += '</ul>';
    if (!isError) html = '<h2>一切正常</h2>';
	return html;
}

function createRuls() {
	var listRules = HTMLHint.rules;

}

