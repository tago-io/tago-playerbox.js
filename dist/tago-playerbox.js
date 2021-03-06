'use strict';

(function(window, document) {
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";

	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})(window, document);

/* jshint unused: false */
function onYouTubeIframeAPIReady() {
	window.tago.playerbox.ready();
}

var tago = window.tago === undefined ? {} : window.tago ;

(function(window, document, tago) {
	var player, hideClass = 'tago-playerbox-hide', elements = {}, isVisible = false,
	loadingImgSrc = 'tago-playerbox-loading.gif',playerIsReady = false, playeroptions = {
		playerVars: {
			autoplay: 0
		},
		events: {
			onReady: onPlayerReady,
			onStateChange: onPlayerStateChange
		}
	};

	var classes = {
		overlay: 'tago-overlay',
		playerbox: 'tago-playerbox',
		playerboxContent: 'tago-playerbox-content',
		close: 'tago-playerbox-close',
		hide: 'tago-playerbox-hide',
		loading: 'tago-playerbox-loading'
	};

	var templates = {
		overlay: '<div class="{overlay} {hide}"></div>',
		playerbox: '<div class="{playerbox} {hide}"><div class="{playerboxContent}"><div></div><span class="{close}">&times;</span></div></div>',
		loading: '<div class="{loading} {hide}"><img src="{loadingImgSrc}" alt="Loading indicator" /></div>'
	};


	tago.playerbox = {

		/**
		 * Initializes the component by building and adding all the necessary elements to the body. There will
		 * not be any events attached to the elements yet.
		 * This function should be called only once by the onYouTubeIframeAPIReady function.
		 * @param  {String} triggerSelector the css selector to the element that will trigger the video
		 * @param  {String} youtubeId       the youtube id of the video that should be displayed
		 * @param  {String} loadingImgSrc 	the path to the loading image. Default is root
		 * @return {undefined}
		 */
		init: function(triggerSelector, youtubeId, loadingImgSource) {
			buildElements(triggerSelector, loadingImgSource);
			playeroptions.videoId = youtubeId;
			document.body.appendChild(elements.overlay);
			document.body.appendChild(elements.loading);
		},

		/**
		 * Initializes the YT player and appends it. The events to show and hide the modal are binded to the
		 * elements.
		 * @return {undefined}
		 */
		ready: function () {
			var videodiv = elements.playerbox.firstElementChild.firstElementChild;
			player = new YT.Player(videodiv, playeroptions);
			document.body.appendChild(elements.playerbox);
			bindEvents();
		}
	};

	/**
	 * Remove the Loading indicator and play the video if the modal is opened
	 * @return {[type]} [description]
	 */
	function onPlayerReady () {
		playerIsReady = true;
		elements.loading.remove();
		if (isVisible) {
			player.playVideo();
		}
	}

	/**
	 * It will hide the modal when the video ends
	 * @param  {Object} event the event data
	 * @return {undefined}
	 */
	function onPlayerStateChange (event) {
		if (event.data === YT.PlayerState.ENDED) {
			hide();
		}
	}

	function buildElements (triggerSelector, loadingImgSource) {
		var div = document.createElement('div');
		div.innerHTML = t(templates.overlay, { overlay: classes.overlay, hide: classes.hide }) +
						t(templates.playerbox, {
							playerbox: classes.playerbox,
							hide: classes.hide,
							playerboxContent: classes.playerboxContent,
							close: classes.close
						}) +
						t(templates.loading, { loading: classes.loading, hide: classes.hide, loadingImgSrc: loadingImgSource || loadingImgSrc });
		elements.trigger = document.querySelector(triggerSelector);
		elements.overlay = div.childNodes[0];
		elements.playerbox = div.childNodes[1];
		elements.close = elements.playerbox.firstElementChild.childNodes[1];
		elements.loading = div.childNodes[2];
	}

	function bindEvents () {
		elements.trigger.addEventListener('click', function () {
			show();
		});

		elements.close.addEventListener('click', function () {
			hide();
		});

		document.addEventListener('keyup', function (event) {
			if ((event.which === 27 || event.keyCode === 27) && isVisible) {
				hide();
			}
		});
	}

	function show() {
		isVisible = true;
		fadeIn(elements.overlay);
		elements.playerbox.classList.remove(hideClass);
		elements.loading.classList.remove(hideClass);
		if (playerIsReady) {
			player.playVideo();
		}
	}

	/**
	 * Hides the modal and the video player. It will also stop the video and reward it back to 0s.
	 * @return {undefined}
	 */
	function hide() {
		isVisible = false;
		fadeOut(elements.overlay);
		elements.playerbox.classList.add(hideClass);
		elements.loading.classList.add(hideClass);
		if (playerIsReady) {
			player.stopVideo();
			player.seekTo(0, true);
		}
	}

	function t(s, d) {
		for (var p in d) {
			if (d.hasOwnProperty(p)) {
				s = s.replace(new RegExp('{' + p + '}', 'g'), d[p]);
			}
		}
		return s;
	}

	/**
	 * Fade Out animation
	 * @param  {DOMElement} el 		the element to be animated
	 * @return {undefined}
	 */
	function fadeOut(el){
		el.style.opacity = 1;

		(function fade() {
			var val = parseFloat(el.style.opacity);
			val = (val - 0.1).toFixed(1);
			if (val < 0) {
				el.style.display = "none";
				el.classList.add('tago-playerbox-hide');
			} else {
				el.style.opacity  = val;
				requestAnimationFrame(fade);
			}
		})();
	}

	/**
	 * Fade In animation
	 * @param  {DOMElement} el      the element to be animated
	 * @param  {String} display 	the final display type. Default: block
	 * @return {undefined}
	 */
	function fadeIn(el, display){
		if (el.classList.contains('tago-playerbox-hide')){
			el.classList.remove('tago-playerbox-hide');
		}
		el.style.opacity = 0;
		el.style.display = display || "block";

		(function fade() {
			var val = parseFloat(el.style.opacity);
			if (((val += 0.2) < 1)) {
				el.style.opacity = val;
				requestAnimationFrame(fade);
			}
		})();
	}

})(window, document, tago);
