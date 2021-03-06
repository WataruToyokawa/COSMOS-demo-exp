/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2020 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

var GetTilesWithin = require('./GetTilesWithin');
var GetRandom = require('../../utils/array/GetRandom');

/**
 * Randomizes the indexes of a rectangular region of tiles (in tile coordinates) within the
 * specified layer. Each tile will receive a new index. If an array of indexes is passed in, then
 * those will be used for randomly assigning new tile indexes. If an array is not provided, the
 * indexes found within the region (excluding -1) will be used for randomly assigning new tile
 * indexes. This method only modifies tile indexes and does not change collision information.
 *
 * @function Phaser.Tilemaps.Components.Randomize
 * @private
 * @since 3.0.0
 *
 * @param {integer} [tileX=0] - The left most tile index (in tile coordinates) to use as the origin of the area.
 * @param {integer} [tileY=0] - The top most tile index (in tile coordinates) to use as the origin of the area.
 * @param {integer} [width=max width based on tileX] - How many tiles wide from the `tileX` index the area will be.
 * @param {integer} [height=max height based on tileY] - How many tiles tall from the `tileY` index the area will be.
 * @param {integer[]} [indexes] - An array of indexes to randomly draw from during randomization.
 * @param {Phaser.Tilemaps.LayerData} layer - The Tilemap Layer to act upon.
 */
var Randomize = function (tileX, tileY, width, height, indexes, layer)
{
    var i;
    var tiles = GetTilesWithin(tileX, tileY, width, height, null, layer);

    // If no indices are given, then find all the unique indexes within the specified region
    if (indexes === undefined)
    {
        indexes = [];
        for (i = 0; i < tiles.length; i++)
        {
            if (indexes.indexOf(tiles[i].index) === -1)
            {
                indexes.push(tiles[i].index);
            }
        }
    }

    for (i = 0; i < tiles.length; i++)
    {
        tiles[i].index = GetRandom(indexes);
    }
};

module.exports = Randomize;
