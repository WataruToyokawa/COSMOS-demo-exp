/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2020 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

/**
 * Collision Types - Determine if and how entities collide with each other.
 *
 * In ACTIVE vs. LITE or FIXED vs. ANY collisions, only the "weak" entity moves,
 * while the other one stays fixed. In ACTIVE vs. ACTIVE and ACTIVE vs. PASSIVE
 * collisions, both entities are moved. LITE or PASSIVE entities don't collide
 * with other LITE or PASSIVE entities at all. The behavior for FIXED vs.
 * FIXED collisions is undefined.
 *
 * @namespace Phaser.Physics.Impact.COLLIDES
 * @memberof Phaser.Physics.Impact
 * @since 3.0.0
 */

module.exports = {

    /**
     * Never collides.
     *
     * @name Phaser.Physics.Impact.COLLIDES.NEVER
     * @type {integer}
     * @const
     * @since 3.0.0
     */
    NEVER: 0,

    /**
     * Lite collision.
     *
     * @name Phaser.Physics.Impact.COLLIDES.LITE
     * @type {integer}
     * @const
     * @since 3.0.0
     */
    LITE: 1,

    /**
     * Passive collision.
     *
     * @name Phaser.Physics.Impact.COLLIDES.PASSIVE
     * @type {integer}
     * @const
     * @since 3.0.0
     */
    PASSIVE: 2,

    /**
     * Active collision.
     *
     * @name Phaser.Physics.Impact.COLLIDES.ACTIVE
     * @type {integer}
     * @const
     * @since 3.0.0
     */
    ACTIVE: 4,

    /**
     * Fixed collision.
     *
     * @name Phaser.Physics.Impact.COLLIDES.FIXED
     * @type {integer}
     * @const
     * @since 3.0.0
     */
    FIXED: 8

};
