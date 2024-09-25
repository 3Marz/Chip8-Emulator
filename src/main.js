let run = false;

let runButton = document.getElementById("run");
let resetButton = document.getElementById("reset");
let stepButton = document.getElementById("step");

let romSelecter = document.getElementById("rom-selecter")

stepButton.onclick = () => {
	updateDebug();
	console.log(CHIP8.opcode.toString(16))
	CHIP8.step();
}

runButton.onclick = () => {
	if(run)
		runButton.innerHTML = "Run";
	else
		runButton.innerHTML = "Pause"
	run = !run;
}

resetButton.onclick = () => {
	CHIP8.reset()
}

addEventListener("resize", () => {
	let factor = Math.floor(window.innerWidth/80)
	if (factor > 18) { factor = 18 }
	document.getElementById('screen').style.width = (64*factor) + "px" 
	document.getElementById('screen').style.height = (32*factor) + "px" 
})

function getControls(rom){
	switch (rom) {
		case "Tetris":
			return "W: Left, E: Right, Q:Rotate, A:Drop"
		case "Snake":
			return "W: Up, A: Left, S: Down, D: Right"
		case "Space Invaders":
			return "Q: Left, W: Shot/Start, E: Right"
		case "Brick":
			return "Q: Left, E: Right"
		case "Pong":
			return "1: Up, Q: Down"
		case "Cave":
			return "2: Up, S: Down, Q: Left, E: Right, V: Re/Start"
		case "Blinky":
			return "A: Left, S: Right, 3: Up, E: Down"
		default:
			return "?";
	}
}

// Load a chip8 rom file
async function loadRom(rom) {
	romSelecter.innerHTML = rom;
	const res = await fetch('../roms/'+rom+'.ch8');
	const arrayBuffer = await res.arrayBuffer();
	const unit8 = new Uint8Array(arrayBuffer)
	CHIP8.reset()
	CHIP8.load(unit8);
	if (run == false) { run = true; }
	document.getElementById("dropRomMenu").blur()
	document.getElementById("controllerTooltip").setAttribute("data-tip", getControls(rom))
}

function update()
{
	requestAnimationFrame(update);

	if(run == true) {

		for(let i = 0; i < stepsPerSec; i++){
			CHIP8.step()	
			if(debugCheck.checked)
				updateDebug()
		};
		
		CHIP8.update_timers()

	}
}

update();


