var playerParam = {
	onCreate: player => { },
	pcode: 'gycmkyOm7AN6BDXtB3IsEZEC2D7z',
	playerBrandingId: '69b95298bb38475188f726e6e6a8e407',
	debug: true,
	aspectRatio: '16:9',
	ve_playlistsPlugin: {
		data: ['60971b77751e406f84612ec5ef0d0bb3'],
		elementId: 'playlist',
		highlightActive: true,
		onLoad: function () { hideSpinner(); },
		onItemClick: function (item, index) {
			function scrollTo(element, to, duration) {
				if (duration < 0) return;
				var difference = to - element.scrollTop;
				var perTick = difference / duration * 2;

				setTimeout(() => {
					element.scrollTop = element.scrollTop + perTick;
					scrollTo(element, to, duration - 2);
				}, 10);
			};
			scrollTo(document.body, 0, 50);
		},
		customCssClasses: {
			'container': 'Playlist-assets',
			'item': 'Playlist-asset animated fadeInUp',
			'image': 'Playlist-asset-image',
			'info': 'Playlist-asset-info',
			'title': 'Playlist-header'
		},
		color: '#5C2D91'
	},
	carousel: true,
	loop: true,
	useFirstVideoFromPlaylist: true,
	autoplay: true,
	skin: {
		config: '//player.ooyala.com/static/v4/stable/latest/skin-plugin/skin.json'
	},
};

OO.ready(() => {
	window.pp = OO.Player.create('ooyala_player', 'QzYm04ODE6FxPakJpa2XYPl4TIgyaaLq', playerParam);
});
// Hide spinner once we get assets

function hideSpinner() {
	let spinner = document.getElementById('spinner');
	spinner.className = "spinner animated fadeOutUp";
	setTimeout(() => {
		spinner.className = "spinner hide";
	}, 1000);
}
