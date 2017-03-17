# beIN - Custom Ooyala playlist plugin #
Custom playlist plugin for Ooyala player v4.
Source code of the plugin is located under the ```src``` folder.
An example of the usage of the plugin is located under the ```example``` folder.

### Configuration ###
The playlist plugin is configured by the following properties of the ```playerParam``` object used to create the player:

##carousel##
```boolen```
If true, when a video finishes it is sent to the bottom of the playlist. Default is false.
##loop##
```boolean``` 
If true, when the last video finishes playing the first video of the playlist is started next. Requires the ```autoplay``` property set to true. Default is false.
##autoplay##
```boolean``` 
If true, autoplays the next video in the playist when a video is done. Default is false.
##useFirstVideoFromPlaylist##
```boolean``` 
If true, the first video from the playlist is played when the player is loaded, instead of the original embed code .Default is false.
##ve_playlistsPlugin##
Configuration object which has the following properties:
#data#
```array```
An array of themebuilder playlists IDs. Must have at least one item.
#elementId#
```string```
DOM element ID of the div where the playlist should be rendered.
#highlightActive#
```boolean```
If true, the currently playing item is highlighted. Default true.
#onLoad#
```function```
Function to call when the playlist finishes loading.
#onItemClick#
```function```
Function to call when an item gets clicked. Receives two parameters: ```item``` and ```index```.
#color#
```string```
Color to use for highlighted items.
#customCssClasses#
```object```
css classes to use for the playlist elements.
Default object is:
```
customCssClasses: {
			'container': 'Playlist-assets',
			'item': 'Playlist-asset animated fadeInUp',
			'image': 'Playlist-asset-image',
			'info': 'Playlist-asset-info',
			'title': 'Playlist-header'
            }
```

An example of a configuration setup is found under ```example/js/beinsports.js```

### Example  ###
```example/index.html``` 
Is a sample webpage that loads the player, along with it's dependencies, the playlist plugin and a custom javascript file ```example/js/beinsports.js``` which configures the playlist plugin.

```example/js/beinsports.js``` is a script that configures and loads the Ooyala player and also configures the playlist plugin. This particular example includes two custom event listeners that subcsribe to the
playlist events: 
onLoad: which hides the loading spinner that was added in ```example/index.html```
onItemClick: which, when clicking on an item of the playlist, scrolls to the top of the page.

### Contributing ###
Create a new branch with your changes and submit a PR. We'll review it and get in contact.