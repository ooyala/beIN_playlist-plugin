var pluginName = 've_playlistsPlugin';
OO.plugin(pluginName, function (OO, _, $) {
    return PlaylistPlugin;
});

function PlaylistPlugin(mb) {
    var self = this;
    var defaultConfig = {
        highlightActive: true,
        customCssClasses: {
            'container': 'oo-playlist',
            'title': 'oo-playlist-title',
            'item': 'oo-playlist-item',
            'image': 'oo-playlist-item-image',
            'info': 'oo-playlist-item-info',
        },
        color: '#CCCCCC',
        highlightTextColor: '#FFFFFF',
        autoplay: true,
        loop: false,
        useFirstVideoFromPlaylist: false
    };

    //state
    var playlist = null;
    var playlistData = null;
    var config = null;
    var currentItemIndex = null;

    function addCssStyles(){
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet){
          style.styleSheet.cssText = css;
        } else {
          style.appendChild(document.createTextNode(css));
        }
        head.appendChild(style);
    }

    self.init = function () {
        mb.subscribe(OO.EVENTS.PLAYER_CREATED, pluginName, onPlayerCreated);
        mb.subscribe(OO.EVENTS.PLAYED, pluginName, onPlayed);
        addCssStyles();
    };

    self.destroy = function () {
        if (playlist) {
            playlist.destroy();
            playlist = null;
        }
        mb.unsubscribe(OO.EVENTS.PLAYER_CREATED, pluginName);
        mb.unsubscribe(OO.EVENTS.PLAYED, pluginName);
    }

    function onPlayerCreated(event, elementId, params) {
        config = deepAssign(Object.assign({}, defaultConfig, params), params[pluginName]);
        //TODO
        if (!config.elementId) {
            //Create default div. and assign id to config.elementId property.
        }
        config.useFirstVideoFromPlaylist = params.useFirstVideoFromPlaylist !== undefined ? params.useFirstVideoFromPlaylist : defaultConfig.useFirstVideoFromPlaylist
        config.loop = params.loop !== undefined ? params.loop : defaultConfig.loop;
        var errors = validateConfig(config);
        if (errors.length === 0) {
            //TODO plugin only supports a single playlist.
            var playlistId = config.data[0];
            getPlaylist(config.pcode, playlistId).then(response => {
                if (response.error === "ok" && response.data.length > 0) {
                    currentItemIndex = 0;
                    playlistData = { name: response.name, items: response.data };
                    var embedCode = response.data[0].embed_code;
                    getMetadata(config.playerBrandingId, embedCode, config.pcode).then(response => {
                        if (!params[pluginName].color) {
                            var playlistModule = response.metadata[embedCode].modules["v3-playlists"];
                            if (playlistModule) {
                                config.color = playlistModule.metadata.ActiveMenuColor || config.color;
                            }
                        }
                        if (config.onLoad) {
                            config.onLoad();
                        }
                        if (config.useFirstVideoFromPlaylist) {
                            mb.publish(OO.EVENTS.SET_EMBED_CODE, playlistData.items[0].embed_code,config);
                        }
                        playlist = new Playlist(config.elementId, config.customCssClasses, config.highlightActive, onItemClick, config.color, config.highlightTextColor);
                        playlist.render(playlistData, config.useFirstVideoFromPlaylist);
                    }).catch(console.error);
                } else {
                    console.log(pluginName + ': fetched ' + response.data.length + ' items.');
                    console.error(response.error);
                }
            }).catch(console.error);
        } else {
            console.error(pluginName + ': config is missing params: ' + errors.join());
            self.destroy();
        }
    }

    function onPlayed(event) {
        if (config.carousel) {
            //move currentItemIndex to the bottom of the array.
            playlistData.items = [...playlistData.items.slice(0, currentItemIndex), ...playlistData.items.slice(currentItemIndex + 1, playlistData.items.length), playlistData.items[currentItemIndex]];
            if (config.autoplay) {
                currentItemIndex = -1;
            } else {
                currentItemIndex = playlistData.items.length - 1;
                if (config.highlightActive) {
                    playlist.setHighlightItem(currentItemIndex);
                }
            }
            playlist.render(playlistData);
        }

        if (config.autoplay) {
            currentItemIndex++;
            if (currentItemIndex < playlistData.items.length) {
                mb.publish(OO.EVENTS.SET_EMBED_CODE, playlistData.items[currentItemIndex].embed_code, config);
                if (config.highlightActive) {
                    playlist.setHighlightItem(currentItemIndex);
                }
            } else if (config.loop) {
                currentItemIndex = 0;
                mb.publish(OO.EVENTS.SET_EMBED_CODE, playlistData.items[currentItemIndex].embed_code, config);
                if (config.highlightActive) {
                    playlist.setHighlightItem(currentItemIndex);
                }
            }
        }
    }

    function onItemClick(item, index) {
        currentItemIndex = index;
        mb.publish(OO.EVENTS.SET_EMBED_CODE, playlistData.items[currentItemIndex].embed_code, config);
        if (config.onItemClick) {
            config.onItemClick(item, index);
        }
    }

    function validateConfig(config) {
        var errors = [];

        if (!config.data || !config.data.length > 1) {
            errors.push("At least one playlist id should be provided in the 'data' param.");
        }
        if (!config.autoplay && config.loop) {
            console.info(pluginName + ": INFO autoplay needs to be enabled for loop to work.");
        }

        return errors;
    }

    function getPlaylist(pcode, playlistId) {
        var playlistUrl = OO.SERVER.API + '/api/v1/playlist/' + pcode + '/' + playlistId;
        return new Promise((resolve, reject) => {
            getJSON(playlistUrl).then(resolve).catch(reject);
        });
    }

    function getMetadata(playerId, embedCode, pcode) {
        var metadataUrl = OO.SERVER.API + '/player_api/v1/metadata/embed_code/' + playerId + '/' + embedCode + '?videoPcode=' + pcode;
        return new Promise((resolve, reject) => {
            getJSON(metadataUrl).then(resolve).catch(reject);
        });
    }

    function getJSON(url) {
        return new Promise((resolve, reject) => {
            var request = new XMLHttpRequest();
            request.open('GET', url, true);

            request.onload = function () {
                if (request.status >= 200 && request.status < 400) {
                    var data = JSON.parse(request.responseText);
                    resolve(data);
                } else {
                    reject(request.status);
                }
            };

            request.onerror = function (err) {
                reject(err);
            };

            request.send();
        });
    }

    function deepAssign(target, object) {
        if (!object) {
            return;
        }
        JSON.stringify(object);//Will throw a TypeError exception if it detects any circular references.
        Object.keys(object).forEach(k => {
            if (!Array.isArray(target[k]) && typeof target[k] === "object") {
                deepAssign(target[k], object[k]);   //deep copy
            } else {
                target[k] = object[k];  //replace value
            }
        });
        return target;
    }
    self.init();
}

function Playlist(elementId, styles, highlightActive, onItemClick, color, highlightTextColor) {
    var self = this;

    self.render = function (playlist, useFirstVideoFromPlaylist, activeItemIndex = 0) {
        self.destroy();

        // Playlist container
        var playlistElement = document.getElementById(elementId);
        playlistElement.className = styles.container;
       
        playlist.items.forEach((asset, index) => {

            var activeClass = '';

            // Playlist item container
            var item = document.createElement("div");

            if (highlightActive && (
                (useFirstVideoFromPlaylist && index === 0 && activeItemIndex === 0) ||
                (index !== 0 && index === activeItemIndex))) {
                // item is active
                activeClass = 'active';
                item.style.backgroundColor = color;
                item.style.color = highlightTextColor;
            }
            item.className = `${styles.item} ${activeClass}`;

            // Playlist item events
            item.addEventListener('mouseover', (e) => {
                item.style.backgroundColor = color;
                item.style.color = highlightTextColor;
            });
            item.addEventListener('mouseout', (e) => {
                if (item.className.indexOf('active') === -1) {
                    item.style.backgroundColor = 'inherit';
                    item.style.color = 'initial';
                }
            });
            item.addEventListener('click', (e) => {
                onItemClick(asset, index);
                if (highlightActive) {
                    self.setHighlightItem(index);
                }
            });
            // Playlist item image
            var itemImageContainer = document.createElement("div");
            itemImageContainer.className = styles.image;
            var itemImage = document.createElement("img");
            itemImage.src = asset.image;
            itemImage.alt = asset.name;
            // Playlist item info
            var itemInfoContainer = document.createElement("div");
            itemInfoContainer.className = styles.info;
            var itemInfo = document.createElement("p");
            itemInfo.innerHTML = asset.name;

            itemImageContainer.appendChild(itemImage);
            itemInfoContainer.appendChild(itemInfo);
            item.appendChild(itemImageContainer);
            item.appendChild(itemInfoContainer);

            playlistElement.appendChild(item);
        });

    }

    self.destroy = function () {
        var playlist = document.getElementById(elementId);
        while (playlist.firstChild) {
            playlist.removeChild(playlist.firstChild);
        }
    }

    self.setHighlightItem = function (index) {
        var prevActive = document.getElementsByClassName(`${styles.item} active`)[0];
        if (prevActive) {
            prevActive.className = styles.item;
            prevActive.style.backgroundColor = 'inherit';
            prevActive.style.color = 'initial';
        }
        var nextActive = document.getElementsByClassName(styles.item)[index];
        nextActive.className = `${styles.item} active`;
        nextActive.style.backgroundColor = color;
        nextActive.style.color = highlightTextColor;
    }
}
var css = `
    .oo-playlist{
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
            -ms-flex-direction: column;
                flex-direction: column;
        position: relative;
    }

    .oo-playlist-item{
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-pack: center;
            -ms-flex-pack: center;
                justify-content: center;
        -webkit-box-align: center;
            -ms-flex-align: center;
                align-items: center;
        margin-bottom: 10px;
        padding: 10px;
    }

    .oo-playlist-item-image{    
        -webkit-box-flex: 0;    
            -ms-flex: 0 1 140px;    
                flex: 0 1 140px;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: center;
            -ms-flex-align: center;
                align-items: center;
    }

    .oo-playlist-item-image img{
        max-width: 150px;
    }

    .oo-playlist-item-info{
        -webkit-box-flex: 1;
            -ms-flex: 1 200px;
                flex: 1 200px;
        padding: 8px 16px;
        padding: .5rem 1rem;
    }`;