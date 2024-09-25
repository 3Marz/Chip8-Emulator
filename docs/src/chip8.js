
// Setting up the canvas
const cvs = document.getElementById("screen");
let scale = Math.floor(window.innerWidth/80);
if (scale > 18) { scale = 18 }
cvs.style.width = (64*scale) + "px";
cvs.style.height = (32*scale) + "px";

function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

let keys = {}

let CHIP8 = {

	// Memory = 4096 byte
	memory: [],
	// Stack = [16](16-bit)
	stack: [],
	// Registers = V[16] 
	v: [],

	//Keypresses
	keys: {
		"0":false, "1":false, "2":false, "3":false,
		"4":false, "5":false, "6":false, "7":false,
		"8":false, "9":false, "a":false, "b":false,
		"c":false, "d":false, "e":false, "f":false,
	},

	// Register I (16-bit)
	i: 0,
	// Program Counter (16-bit)
	pc: 0,
	// Stack Pointer (8-bit)
	sp: 0,

	// Graphics Array
	gfx: [],

	// Image data copyed from [gfx] then displayed by canvas 
	scrn: [],
	ctx: null,

	// Audio Object
	beepSound: new Audio('./beep.wav'),

	// Delay and Sound timers 
	delay_timer: 0,
	sound_timer: 0,

	opcode: 0x0000,

	font_set: [
		0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
		0x20, 0x60, 0x20, 0x20, 0x70, // 1
		0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
		0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
		0x90, 0x90, 0xF0, 0x10, 0x10, // 4
		0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
		0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
		0xF0, 0x10, 0x20, 0x40, 0x40, // 7
		0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
		0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
		0xF0, 0x90, 0xF0, 0x90, 0x90, // A
		0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
		0xF0, 0x80, 0x80, 0x80, 0xF0, // C
		0xE0, 0x90, 0x90, 0x90, 0xE0, // D
		0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
		0xF0, 0x80, 0xF0, 0x80, 0x80  // F
	],

	reset: function () 
	{
		CHIP8.pc = 0x200;
		CHIP8.sp = 0;
		CHIP8.opcode = 0x0000;
		CHIP8.i = 0;
		CHIP8.delay_timer = 0;
		CHIP8.sound_timer = 0;

		for(let i = 0; i < 16; i++)
			CHIP8.stack[i] = 0;
		
		if(CHIP8.memory.length == 0) {
			for(let i = 0; i < 4096; i++)
				CHIP8.memory[i] = 0;
		}

		for(let i = 0; i < 16; i++)
			CHIP8.v[i] = 0x00;

		CHIP8.gfx = new Array(64 * 32);
		for(let i = 0; i < CHIP8.gfx.length; i++)
		{
			CHIP8.gfx[i] = 0;
		}
		CHIP8.ctx = cvs.getContext('2d');
		CHIP8.scrn = CHIP8.ctx.createImageData(64, 32);
		CHIP8.update_scrn()

		for(let i = 0; i < CHIP8.font_set.length; i++)
		{
			CHIP8.memory[i] = CHIP8.font_set[i]
		}
	},

	load: function (rom) 
	{
		// Load a rom file
		for(let i = 0; i < rom.length; i++)
		{
			CHIP8.memory[i + 512] = rom[i]
		}
	},

	update_scrn: function ()
	{
		for(let i = 0; i < CHIP8.gfx.length; i++)
		{
			let accI = i*4;
			CHIP8.scrn.data[accI  ] = CHIP8.gfx[i]==1 ? fgColor.r : bgColor.r;
			CHIP8.scrn.data[accI+1] = CHIP8.gfx[i]==1 ? fgColor.g : bgColor.g;
			CHIP8.scrn.data[accI+2] = CHIP8.gfx[i]==1 ? fgColor.b : bgColor.b;
			CHIP8.scrn.data[accI+3] = 255
		}
		CHIP8.ctx.putImageData(CHIP8.scrn,0,0)
	},

	update_timers: function () 
	{
		if(CHIP8.delay_timer > 0)	{
			CHIP8.delay_timer--;
		}
		if(CHIP8.sound_timer > 0) {
			CHIP8.beepSound.play()
			CHIP8.sound_timer--;
		}
	},

	step: function ()
	{ 
		CHIP8.opcode = (CHIP8.memory[CHIP8.pc] << 8) | CHIP8.memory[CHIP8.pc+1] 
		let opcode = CHIP8.opcode;
		// console.log((opcode&0xF000).toString(16))

		switch(opcode&0xF000)
		{
			
			case 0x0000:
				switch(opcode&0x000F)
				{
					// CLS
					case 0x0000:
						CHIP8.gfx = new Array(64 * 32);
						CHIP8.update_scrn();
						CHIP8.pc+= 2
						break;

					// RET
					case 0x000E:
						// IDK if it should be deleted
						CHIP8.pc = CHIP8.stack[CHIP8.sp];
						CHIP8.stack[CHIP8.sp] = 0
						if(CHIP8.sp != 0) { CHIP8.sp-- };
						break;
				}
				break;

			// JP addr
			case 0x1000:
				CHIP8.pc = (opcode&0x0FFF);
				break;

			// CALL addr
			case 0x2000:
				CHIP8.pc += 2;
				if(CHIP8.stack[CHIP8.sp] != 0) { CHIP8.sp++ }
				CHIP8.stack[CHIP8.sp] = CHIP8.pc;
				CHIP8.pc = (opcode&0x0FFF);
				break;

			// SE Vx, byte
			case 0x3000:
				var x = (opcode>>8)&0x000F;
				if(CHIP8.v[x] == (opcode&0x00FF)){
					CHIP8.pc += 4;
				}else {
					CHIP8.pc += 2;
				}
				break;

			// SNE Vx, byte
			case 0x4000:
				var x = (opcode>>8)&0x000F;
				if(CHIP8.v[x] != (opcode&0x00FF)){
					CHIP8.pc += 4;
				}else {
					CHIP8.pc += 2;
				} 
				break;

			// SE Vx, Vy
			case 0x5000:
				var x = (opcode>>8)&0x000F;
				var y = (opcode>>4)&0x000F;
				if(CHIP8.v[x] == CHIP8.v[y]){
					CHIP8.pc += 4;
				} else {
					CHIP8.pc += 2;
				}
				break;

			// LD Vx, btye
			case 0x6000:
				var x = (opcode>>8)&0x000F;
				var byte = opcode&0x00FF;
				CHIP8.v[x] = byte;
				CHIP8.pc += 2;
				break;

			// ADD Vx, byte
			case 0x7000:
				var x = (opcode&0x0F00)>>8;
				var byte = opcode&0x00FF;
				var res = CHIP8.v[x]+byte
				if(res > 255) { res -= 256 }
				CHIP8.v[x] = res;
				CHIP8.pc += 2;
				break;

			// 8xy(num)
			case 0x8000:
				switch(opcode&0xF00F)
				{
					// LD Vx, Vy
					case 0x8000:
						var x = (opcode>>8)&0x000F;
						var y = (opcode>>4)&0x000F;
						CHIP8.v[x] = CHIP8.v[y];
						CHIP8.pc += 2;
						break;

					// OR Vx, Vy
					case 0x8001:
						var x = (opcode>>8)&0x000F;
						var y = (opcode>>4)&0x000F;
						CHIP8.v[x] |= CHIP8.v[y];
						CHIP8.pc += 2;
						break;

					// AND Vx, Vy
					case 0x8002:
						var x = (opcode>>8)&0x000F;
						var y = (opcode>>4)&0x000F;
						CHIP8.v[x] &= CHIP8.v[y];
						CHIP8.pc += 2;
						break;

					// XOR Vx, Vy
					case 0x8003:
						var x = (opcode>>8)&0x000F;
						var y = (opcode>>4)&0x000F;
						CHIP8.v[x] ^= CHIP8.v[y];
						CHIP8.pc += 2;
						break;

					// ADD Vx, Vy
					case 0x8004:
						var x = (opcode>>8)&0x000F;
						var y = (opcode>>4)&0x000F;
						var result = CHIP8.v[x] + CHIP8.v[y];
						if(result > 255)
						{
							CHIP8.v[0xF] = 1;
						}
						else
						{
							CHIP8.v[0xF] = 0;
						}
						CHIP8.v[x] = result&0xFF;
						CHIP8.pc += 2;
						break;

					// SUB Vx, Vy
					case 0x8005:
						var x = (opcode>>8)&0x000F;
						var y = (opcode>>4)&0x000F;
						if(CHIP8.v[x] >= CHIP8.v[y])
						{
							CHIP8.v[0xF] = 1;
						}
						else
						{
							CHIP8.v[0xF] = 0;
						}
						var res = CHIP8.v[x] - CHIP8.v[y];
						if( res < 0 ) { res += 256 }
						CHIP8.v[x] = res;
						CHIP8.pc += 2;
						break;

					// SHR Vx, {, Vy}
					case 0x8006:
						var x = (opcode>>8)&0x000F;
						var y = (opcode>>4)&0x000F;
						CHIP8.v[0xF] = CHIP8.v[y]&0b00000001;
						CHIP8.v[x] >>>= 1;
						CHIP8.pc += 2;
						break;

					// SUBN Vx, Vy
					case 0x8007:
						var x = (opcode>>8)&0x000F;
						var y = (opcode>>4)&0x000F;
						if(CHIP8.v[y] >= CHIP8.v[x])
						{
							CHIP8.v[0xF] = 1;
						}
						else
						{
							CHIP8.v[0xF] = 0;
						}
						var res = CHIP8.v[y] - CHIP8.v[x];
						if( res < 0 ){ res += 256 }
						CHIP8.v[x] = res;
						CHIP8.pc += 2;
						break;

					// SHL Vx, {, Vy}
					case 0x800E:
						var x = (opcode>>8)&0x000F;
						var y = (opcode>>4)&0x000F;
						CHIP8.v[0xF] = (CHIP8.v[y]>>7);
						CHIP8.v[x] <<= 1;
						CHIP8.pc += 2;
						break;


				}
				break;

			// SNE Vx, Vy
			case 0x9000:
				var x = (opcode&0x0F00)>>8;
				var y = (opcode&0x00F0)>>4;
				if(CHIP8.v[x] != CHIP8.v[y]) {
					CHIP8.pc += 4;
				} else {
					CHIP8.pc += 2;
				}
				break;

			// LD I, addr
			case 0xA000:
				CHIP8.i = opcode&0x0FFF;
				CHIP8.pc += 2;
				break;

			// JP V0, addr
			case 0xB000:
				var addr = opcode&0x0FFF;
				CHIP8.pc = addr + CHIP8.v[0];
				break;

			// RND Vx, byte
			case 0xC000:
				var x = (opcode>>8)&0x000F;
				var rand = getRandomIntInclusive(0, 255);
				var byte = (opcode)&0x00FF;
				CHIP8.v[x] = rand&byte;
				CHIP8.pc += 2;
				break;

			// DRW Vx, Vy, nibble 
			case 0xD000:
				var x = CHIP8.v[(opcode>>8)&0x000F];
				var y = CHIP8.v[(opcode>>4)&0x000F];
				var n = opcode&0x000F;

				CHIP8.v[0xF] = 0;
				for(let i = 0; i < n; i++)
				{
					let pixRow = CHIP8.memory[CHIP8.i+i]
					let posY = (y+i)%32;
					for(let k = 0; k < 8; k++)
					{
						let posX = (x+k)%64;
						if((pixRow&(0x80>>k)) != 0) {
							if(CHIP8.gfx[posX + (posY * 64)] == 1) {
								CHIP8.v[0xF] = 1
							}
							CHIP8.gfx[posX + (posY * 64)] ^= 1
						}
						
					}
				}
				CHIP8.update_scrn();
				CHIP8.pc += 2;
				break;

			// Ex00 (Key Input)
			case 0xE000:
				switch(opcode&0x000F)
				{
					// SKP Vx
					case 0x000E:
						var x = (opcode>>8)&0x000F;
						if(CHIP8.keys[CHIP8.v[x].toString(16)] == true) {
							CHIP8.pc += 4;
						} 
						else {
							CHIP8.pc += 2;
						}
						break;

					// SKNP Vx
					case 0x0001:
						var x = (opcode>>8)&0x000F;
						// console.log("keyup at: " + CHIP8.v[x].toString(16))
						if(CHIP8.keys[CHIP8.v[x].toString(16)] == false) {
							CHIP8.pc += 4;
						} 
						else {
							CHIP8.pc += 2;
						}
						break;

				}
				break;

			// Fx00
			case 0xF000:
				switch(opcode&0x00FF)
				{

					// LD Vx, DT
					case 0x0007:
						var x = (opcode>>8)&0x000F;
						CHIP8.v[x] = CHIP8.delay_timer;
						CHIP8.pc += 2;
						break;

					// LD Vx, k (wait for key input)
					case 0x000A:
						//this is it its in the event listner
						break;

					// LD DT, Vx
					case 0x0015:
						var x = (opcode>>8)&0x000F;
						CHIP8.delay_timer = CHIP8.v[x];
						CHIP8.pc += 2;
						break;
						
					// LD ST, Vx
					case 0x0018:
						var x = (opcode>>8)&0x000F;
						CHIP8.sound_timer = CHIP8.v[x];
						CHIP8.pc += 2;
						break;

					// ADD I, Vx
					case 0x001E:
						var x = (opcode>>8)&0x000F;
						CHIP8.i += CHIP8.v[x];
						CHIP8.pc += 2;
						break;

					// LD F, Vx
					case 0x0029:
						var x = (opcode>>8)&0x000F;
						CHIP8.i = (CHIP8.v[x]&0xf)*5;
						CHIP8.pc += 2
						break;

					// LD B, Vx
					case 0x0033:
						var x = (opcode>>8)&0x000F;
						CHIP8.memory[CHIP8.i  ] = Math.floor(CHIP8.v[x]/100);
						CHIP8.memory[CHIP8.i+1] = Math.floor((CHIP8.v[x]/10)%10);
						CHIP8.memory[CHIP8.i+2] = Math.floor((CHIP8.v[x]%100)%10);
						CHIP8.pc += 2; 
						break

					// LD [I], Vx
					case 0x0055:
						var x = (opcode>>8)&0x000F;
						for (let i = 0; i < x+1; i++)
						{
							CHIP8.memory[CHIP8.i+i] = CHIP8.v[i];
						}	
						CHIP8.pc += 2;
						break;

					// LD Vx, [I]
					case 0x0065:
						var x = (opcode>>8)&0x000F;
						for (let i = 0; i < x + 1; i++)
						{
							CHIP8.v[i] = CHIP8.memory[CHIP8.i+i];
						}	
						CHIP8.pc += 2;
						break;
				}
				break;

			default:
				console.log("unimlmanted at opcode:"+CHIP8.opcode.toString(16))
				break;
		}

		

		//console.log(opcode.toString(16))

	},

}

document.addEventListener("keydown", e => {
	if((CHIP8.opcode&0xF00F) == 0xF00A) {
		var x = (CHIP8.opcode>>8)&0x000F;
		var key = -1;
		switch(e.key) {
			case "1":
				key = 0x1; break;
			case "2":
				key = 0x2; break;
			case "3":
				key = 0x3; break;
			case "4":
				key = 0xC; break;

			case "q":
				key = 0x4; break;
			case "w":
				key = 0x5; break;
			case "e":
				key = 0x6; break;
			case "r":
				key = 0xD; break;

			case "a":
				key = 0x7; break;
			case "s":
				key = 0x8; break;
			case "d":
				key = 0x9; break;
			case "f":
				key = 0xE; break;

			case "z":
				key = 0xA; break;
			case "x":
				key = 0x0; break;
			case "c":
				key = 0xB; break;
			case "v":
				key = 0xF; break;
		}
		if(key != -1) {
			CHIP8.v[x] = key//"1".charCodeAt(0);
			CHIP8.pc += 2;
		}
	} 
	else {
		keys[e.key] = true;
		asingKeys()
	}
})

document.addEventListener("keyup", e => {
	keys[e.key] = false;
	asingKeys()
})

function asingKeys()
{
	if(keys["1"] == true) { CHIP8.keys["1"] = true; } else if(keys["1"]==false) { CHIP8.keys["1"] = false }
	if(keys["2"] == true) { CHIP8.keys["2"] = true; } else if(keys["2"]==false) { CHIP8.keys["2"] = false }
	if(keys["3"] == true) { CHIP8.keys["3"] = true; } else if(keys["3"]==false) { CHIP8.keys["3"] = false }
	if(keys["4"] == true) { CHIP8.keys["c"] = true; } else if(keys["4"]==false) { CHIP8.keys["c"] = false }

	if(keys["q"] == true) { CHIP8.keys["4"] = true; } else if(keys["q"]==false) { CHIP8.keys["4"] = false }
	if(keys["w"] == true) { CHIP8.keys["5"] = true; } else if(keys["w"]==false) { CHIP8.keys["5"] = false }
	if(keys["e"] == true) { CHIP8.keys["6"] = true; } else if(keys["e"]==false) { CHIP8.keys["6"] = false }
	if(keys["r"] == true) { CHIP8.keys["d"] = true; } else if(keys["r"]==false) { CHIP8.keys["d"] = false }

	if(keys["a"] == true) { CHIP8.keys["7"] = true; } else if(keys["a"]==false) { CHIP8.keys["7"] = false }
	if(keys["s"] == true) { CHIP8.keys["8"] = true; } else if(keys["s"]==false) { CHIP8.keys["8"] = false }
	if(keys["d"] == true) { CHIP8.keys["9"] = true; } else if(keys["d"]==false) { CHIP8.keys["9"] = false }
	if(keys["f"] == true) { CHIP8.keys["e"] = true; } else if(keys["f"]==false) { CHIP8.keys["e"] = false }

	if(keys["z"] == true) { CHIP8.keys["a"] = true; } else if(keys["z"]==false) { CHIP8.keys["a"] = false }
	if(keys["x"] == true) { CHIP8.keys["0"] = true; } else if(keys["x"]==false) { CHIP8.keys["0"] = false }
	if(keys["c"] == true) { CHIP8.keys["b"] = true; } else if(keys["c"]==false) { CHIP8.keys["b"] = false }
	if(keys["v"] == true) { CHIP8.keys["f"] = true; } else if(keys["v"]==false) { CHIP8.keys["f"] = false }
}
