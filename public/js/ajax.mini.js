/*
	Author:			Hristofor Lukanov
	Description:	AJAX Interface
	========================================

	Example:
	----------------------------------------

	Ajax.setHeader( 'a', '1' );
	Ajax.setHeaders( { 'b': 1, 'c': 2 } );
	Ajax.setHeaders( {'b': null} ); // Remove header

	var Request = Ajax.GET( 'url' );
	var Request = Ajax.POST( 'url' );

	var Request = Ajax.POST( 'url', {
		'data': { 'a': 1, 'b': 2, 'c': 3 },
		'onload': function ( response ) {
			// response.text
			// response.xml
		},
		'onerror': function ( status, error ) { },
		'onfinish': function () { },
		'onstart': function () { },
		'headers': {
			'a': 'a value',
			'b': 'b value'
		},
		'form': 'form1', // name / ID
		'async': true
	} );

	Request.abort();
*/
var Ajax=function(){var p=["Microsoft.XMLHTTP","MSXML2.XMLHTTP","MSXML2.XMLHTTP.3.0"],r=p.length,m=null,u=null,v=function(){v=u?function(){return new m(u)}:function(){return new m};return v()},h=function(b,c){return Object.prototype.hasOwnProperty.call(b,c)},w=function(b){return"object"===typeof b&&b instanceof l},l=function(){},t={"Content-type":"application/x-www-form-urlencoded"},x=function(b,c){var a;return 0<c.keys.length?(a=c.keys.shift(),h(b,a)&&w(b[a])&&""!=a||(""==a&&(a=l.nextIndex(b)),b[a]=
new l),l.push.call(b,a,x(b[a],c)),b):encodeURIComponent(c.value)},y=function(b,c){var a,e="";for(a in b)h(b,a)&&("string"===typeof b[a]?e+=c.keys+(0<c.level?"%5B"+a+"%5D":a)+"="+b[a]+"&":w(b[a])&&(e+=y(b[a],{keys:c.keys+(0<c.level?"%5B"+a+"%5D":a),level:c.level+1})));return e},z=function(b,c,a){var e={onfinish:null,onstart:null,onerror:null,onload:null,async:!0},n=new l,f=v(),q={},k="",m,p,g,d,r=function(a,b,c){var d=b.length,e;"undefined"!==typeof n[a]&&w(n[a])||(n[a]=new l);for(e=0;e<d;e++)b[e]=
b[e].substring(1);l.push.call(n,a,x(n[a],{value:c.value,keys:b,c:a}))};for(d in t)h(t,d)&&(q[d]=t[d]);a||(a={});for(d in a)h(a,d)&&h(e,d)&&(e[d]=a[d]);"boolean"!==typeof e.async&&(e.async=!0);"function"!==typeof e.onfinish&&(e.onfinish=null);"function"!==typeof e.onerror&&(e.onerror=null);"function"!==typeof e.onstart&&(e.onstart=null);"function"!==typeof e.onload&&(e.onload=null);"object"!==typeof a.data&&(a.data={});"object"!==typeof a.headers&&(a.headers={});if(h(a,"headers"))for(d in a.headers)q[d]=
a.headers[d];h(a,"form")&&(h(document.forms,a.form)?g=document.forms[a.form]:document.getElementById(a.form)&&(g=document.getElementById(a.form)));if(g)for(g=g.elements,k=g.length,d=0;d<k;d++)("checkbox"!==g[d].type&&"radio"!==g[d].type||g[d].checked)&&""!=g[d].name&&g[d].name&&((m=g[d].name.match(/^([^\[]+)(?:\[.*?\])+.*?$/))?r(m[1],g[d].name.match(/\[([^\]]*)(?=\])/g),g[d]):n[g[d].name]=encodeURIComponent(g[d].value));k=y(n,{keys:"",level:0});if(h(a,"data"))for(d in a.data)h(a.data,d)&&(k+=encodeURIComponent(d)+
"="+encodeURIComponent(a.data[d])+"&");0<k.length&&"&"==k.charAt(k.length-1)&&(k=k.substring(0,k.length-1));"GET"==b&&0<k.length&&(c+=(-1<c.indexOf("?")?"&":"?")+k);f.onreadystatechange=function(){var b=void 0;if(4==f.readyState||"complete"==f.readyState)200!=f.status?(p=f.statusText,e.onerror&&(200==f.status&&(b={text:f.responseText,xml:f.responseXML}),e.onerror.call(f,f.status,decodeURIComponent(p),b))):h(a,"onload")&&a.onload.call(f,{text:f.responseText,xml:f.responseXML}),e.onfinish&&e.onfinish.call(f)};
e.onstart&&e.onstart.call(f);f.open(b,c,e.async);for(d in q)h(q,d)&&"string"===typeof q[d]&&f.setRequestHeader(d,q[d]);f.send(k);return f};l.push=function(b,c){if(""===b)this[l.nextIndex(this)]=c;else return this[b]=c,this[b]};l.nextIndex=function(b){var c,a=-1;for(c in b)h(b,c)&&/^\d+$/.test(c)&&1*c>a&&(a=1*c);return a+1};if("undefined"!==typeof XMLHttpRequest)m=XMLHttpRequest;else for(m=ActiveXObject;r--;)try{new m(p[r]);u=p[r];break}catch(b){}return{POST:function(b,c){return z("POST",b,c)},GET:function(b,
c){return z("GET",b,c)},setHeader:function(b,c){t[b]=c},setHeaders:function(b){for(var c in b)h(b,c)&&(t[c]=b[c])}}}();