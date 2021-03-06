/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2020 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

var Class = require('../../utils/Class');
var GetFastValue = require('../../utils/object/GetFastValue');

/**
 * @classdesc
 * A class for representing data about about a layer in a map. Maps are parsed from CSV, Tiled,
 * etc. into this format. Tilemap, StaticTilemapLayer and DynamicTilemapLayer have a reference
 * to this data and use it to look up and perform operations on tiles.
 *
 * @class LayerData
 * @memberof Phaser.Tilemaps
 * @constructor
 * @since 3.0.0
 *
 * @param {object} [config] - [description]
 */
var LayerData = new Class({

    initialize:

    function LayerData (config)
    {
        if (config === undefined) { config = {}; }

        /**
         * The name of the layer, if specified in Tiled.
         *
         * @name Phaser.Tilemaps.LayerData#name
         * @type {string}
         * @since 3.0.0
         */
        this.name = GetFastValue(config, 'name', 'layer');

        /**
         * The x offset of where to draw from the top left
         *
         * @name Phaser.Tilemaps.LayerData#x
         * @type {number}
         * @since 3.0.0
         */
        this.x = GetFastValue(config, 'x', 0);

        /**
         * The y offset of where to draw from the top left
         *
         * @name Phaser.Tilemaps.LayerData#y
         * @type {number}
         * @since 3.0.0
         */
        this.y = GetFastValue(config, 'y', 0);

        /**
         * The width in tile of the layer.
         *
         * @name Phaser.Tilemaps.LayerData#width
         * @type {number}
         * @since 3.0.0
         */
        this.width = GetFastValue(config, 'width', 0);

        /**
         * The height in tiles of the layer.
         *
         * @name Phaser.Tilemaps.LayerData#height
         * @type {number}
         * @since 3.0.0
         */
        this.height = GetFastValue(config, 'height', 0);

        /**
         * The pixel width of the tiles.
         *
         * @name Phaser.Tilemaps.LayerData#tileWidth
         * @type {number}
         * @since 3.0.0
         */
        this.tileWidth = GetFastValue(config, 'tileWidth', 0);

        /**
         * The pixel height of the tiles.
         *
         * @name Phaser.Tilemaps.LayerData#tileHeight
         * @type {number}
         * @since 3.0.0
         */
        this.tileHeight = GetFastValue(config, 'tileHeight', 0);

        /**
         * [description]
         *
         * @name Phaser.Tilemaps.LayerData#baseTileWidth
         * @type {number}
         * @since 3.0.0
         */
        this.baseTileWidth = GetFastValue(config, 'baseTileWidth', this.tileWidth);

        /**
         * [description]
         *
         * @name Phaser.Tilemaps.LayerData#baseTileHeight
         * @type {number}
         * @since 3.0.0
         */
        this.baseTileHeight = GetFastValue(config, 'baseTileHeight', this.tileHeight);

        /**
         * The width in pixels of the entire layer.
         *
         * @name Phaser.Tilemaps.LayerData#widthInPixels
         * @type {number}
         * @since 3.0.0
         */
        this.widthInPixels = GetFastValue(config, 'widthInPixels', this.width * this.baseTileWidth);

        /**
         * The height in pixels of the entire layer.
         *
         * @name Phaser.Tilemaps.LayerData#heightInPixels
         * @type {number}
         * @since 3.0.0
         */
        this.heightInPixels = GetFastValue(config, 'heightInPixels', this.height * this.baseTileHeight);

        /**
         * [description]
         *
         * @name Phaser.Tilemaps.LayerData#alpha
         * @type {number}
         * @since 3.0.0
         */
        this.alpha = GetFastValue(config, 'alpha', 1);

        /**
         * [description]
         *
         * @name Phaser.Tilemaps.LayerData#visible
         * @type {boolean}
         * @since 3.0.0
         */
        this.visible = GetFastValue(config, 'visible', true);

        /**
         * Layer specific properties (can be specified in Tiled)
         *
         * @name Phaser.Tilemaps.LayerData#properties
         * @type {object}
         * @since 3.0.0
         */
        this.properties = GetFastValue(config, 'properties', {});

        /**
         * [description]
         *
         * @name Phaser.Tilemaps.LayerData#indexes
         * @type {array}
         * @since 3.0.0
         */
        this.indexes = GetFastValue(config, 'indexes', []);

        /**
         * [description]
         *
         * @name Phaser.Tilemaps.LayerData#collideIndexes
         * @type {array}
         * @since 3.0.0
         */
        this.collideIndexes = GetFastValue(config, 'collideIndexes', []);

        /**
         * [description]
         *
         * @name Phaser.Tilemaps.LayerData#callbacks
         * @type {array}
         * @since 3.0.0
         */
        this.callbacks = GetFastValue(config, 'callbacks', []);

        /**
         * [description]
         *
         * @name Phaser.Tilemaps.LayerData#bodies
         * @type {array}
         * @since 3.0.0
         */
        this.bodies = GetFastValue(config, 'bodies', []);

        /**
         * An array of the tile indexes
         *
         * @name Phaser.Tilemaps.LayerData#data
         * @type {Phaser.Tilemaps.Tile[][]}
         * @since 3.0.0
         */
        this.data = GetFastValue(config, 'data', []);

        /**
         * [description]
         *
         * @name Phaser.Tilemaps.LayerData#tilemapLayer
         * @type {(Phaser.Tilemaps.DynamicTilemapLayer|Phaser.Tilemaps.StaticTilemapLayer)}
         * @since 3.0.0
         */
        this.tilemapLayer = GetFastValue(config, 'tilemapLayer', null);
    }

});

module.exports = LayerData;
