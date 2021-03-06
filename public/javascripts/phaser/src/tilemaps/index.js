/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2020 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

/**
 * @namespace Phaser.Tilemaps
 */

module.exports = {

    Components: require('./components'),
    Parsers: require('./parsers'),

    Formats: require('./Formats'),
    ImageCollection: require('./ImageCollection'),
    ParseToTilemap: require('./ParseToTilemap'),
    Tile: require('./Tile'),
    Tilemap: require('./Tilemap'),
    TilemapCreator: require('./TilemapCreator'),
    TilemapFactory: require('./TilemapFactory'),
    Tileset: require('./Tileset'),

    LayerData: require('./mapdata/LayerData'),
    MapData: require('./mapdata/MapData'),
    ObjectLayer: require('./mapdata/ObjectLayer'),

    DynamicTilemapLayer: require('./dynamiclayer/DynamicTilemapLayer'),
    StaticTilemapLayer: require('./staticlayer/StaticTilemapLayer')

};
