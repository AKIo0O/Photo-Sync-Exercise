// author: tangxm90@gmail.com


;(function(){

	var Helper = {
		
		getDateString: function(time){
			
			var d = new Date(time);
			
			return [ d.getFullYear(), d.getMonth() +1, d.getDate()].join("-");
		},

		serialize: function(photos){
			
			var des = {}, photo, date;
			photos = photos.reverse();
			while (photos.length) {
				photo = photos.pop();
				date  = Helper.getDateString(photo.time);
				des[date] = des[date] || [];
				des[date].push(photo);
			}

			return des;
		},

		ajax: function(opts){
			
			function handler() {
				if(this.readyState == 4) {
			    	if(this.status == 200 && this.responseText != null) {
			    		opts.onsuccess(JSON.parse(this.responseText));
			    		return;
			    	}
			    	opts.onerror(null);
				}
			}

			var client = new XMLHttpRequest();
			client.onreadystatechange = handler;
			client.open(opts.type, opts.url);
			client.async = opts.async || false;
			client.send();
		},

		template: function(tpl, data){
			if(!data) return "";
			return tpl.replace(/\{(\w+)\}/g, function(a, b){
				return data[b];
			});
		},

		debounce: function(func, wait, immediate) {
		    var result;
		    var timeout = null;
		    return function() {
		      var context = this, args = arguments;
		      var later = function() {
		        timeout = null;
		        if (!immediate) result = func.apply(context, args);
		      };
		      var callNow = immediate && !timeout;
		      clearTimeout(timeout);
		      timeout = setTimeout(later, wait);
		      if (callNow) result = func.apply(context, args);
		      return result;
		    };
		}

	};

	// 1.答案
	function group(photos) {
		return Helper.serialize(photos);
	}


	function render(json){

		var photos = Helper.serialize(json.photos),
			el     = document.getElementById("photos"),
			tpl    = document.getElementById("photo").innerHTML;

		for(var photo in photos){
			
			var h3    = document.createElement("h3"),
				aside = document.createElement("aside");

			var arr  = photos[photo],
				html = "",
				i    = 0;

			// 如果不支持max-width和max-height做一下逻辑处理:
			// var max = height > width ? "height" : "width";
			// if (obj[max] > 160) 按照比例(max/160)进行计算到另一个的长度
			// else 无需处理 

			while(arr.length){
				i++;
				html += Helper.template(tpl, arr.pop());
				if (i == 5) {
					i = 0;
					html += "<br>";
				}
			}

			aside.innerHTML = html;
			h3.innerHTML = photo;
			
			el.appendChild(h3);
			el.appendChild(aside);
		}
		next = json.nextURL;
	}

	function nextPage(url){
		Helper.ajax({
			url : url || "http://photo-sync.herokuapp.com/photos",
			type: "get",
			onsuccess: render
		});
	}

	// renderFirstPage
	nextPage();

	var next = "", body = document.body;

	// 放在里面计算是为了防止resize造成脏数据
	window.onscroll = Helper.debounce(function(){
		var scrollHeight = body.scrollHeight,
			clientHeight = window.innerHeight,
			scrollTop    = body.scrollTop;
		console.log(scrollHeight,clientHeight,scrollTop)
		if(scrollTop + clientHeight + 200 > scrollHeight){
			nextPage(next);
		}
	},100);


})();