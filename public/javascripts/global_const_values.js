'use strict';

// === Socket.io ====
export const portnumQuestionnaire = 8000
	// , htmlServer = 'http://192.168.33.10:' // vagrant server (for debug)
	// , htmlServer = 'http://63-250-60-135.cloud-xip.io:' //kamatera
	// , htmlServer = 'http://63.250.60.135:' //kamatera
	, htmlServer = 'http://tk2-127-63496.vs.sakura.ne.jp:' //sakura vos
	, exceptions = ['INHOUSETEST3', 'COSMOS']
	, portnum = 8989
	, socket = io.connect(htmlServer+portnum, { query: {amazonID: amazonID, condition: condition} }) // portnum is defined in game.ejs
	// , socket = io.connect(htmlServer+portnum, { query: 'amazonID='+amazonID, condition: condition }) // portnum is defined in game.ejs
;

// ==== Basic parameters ====
export const configWidth = 768 //800
	, configHeight = 768 // 600
	, field_x_floor = 16 // the x-axis pixcel where the grid starts
	, field_y_floor = 50 // the y-axis picxel where the grid starts
	, fieldWidth = configWidth * 0.75 
	, fieldHeight = configHeight * 0.75 
	, num_cell = 4
	, cell_size_x = fieldWidth / num_cell
	, cell_size_y = fieldHeight / num_cell
	, optionWidth = 150
	, optionHeight = 150
	, maxLatencyForGroupCondition = 1500
	, noteColor = '#ff5a00' // red-ish
	, nomalTextColor = '#000000' // black
;

// === colours ======
export const Primary = 0x521B93
export const PrimaryLight = 0x832AEE
export const Background = 0x421278
export const Secondary = 0xFFAD00
export const White = 0xffffff
export const Rainbow = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x2E2B5F, 0x8B00FF]

// === text box colours ==
export const COLOR_PRIMARY_TEXTBOX = 0x4e342e;
export const COLOR_LIGHT_TEXTBOX = 0x7b5e57;
export const COLOR_DARK_TEXTBOX = 0x260e04;