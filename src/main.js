import { CHIP8 } from "./chip8";
import { debugCheck, updateDebug } from "./debug";
import { stepsPerSec } from "./config";

let run = false;

const screen = document.getElementById("screen")

const runButton = document.getElementById("run");
const resetButton = document.getElementById("reset");
const stepButton = document.getElementById("step");

const romSelecter = document.getElementById("rom-selecter")

const inputRom = document.getElementById("input-rom")
const dropArea = document.getElementById("drop-area")

stepButton.onclick = () => {
	updateDebug();
	console.log(CHIP8.opcode.toString(16))
	CHIP8.step();
}

function toggleRun() {
	run = !run;
	if(run)
		runButton.innerHTML = "Pause";
	else
		runButton.innerHTML = "Run"
}

runButton.onclick = toggleRun

resetButton.onclick = () => {
	CHIP8.reset()
}

addEventListener("resize", () => {
	let factor = Math.floor(window.innerWidth/80)
	if (factor > 18) { factor = 18 }
	screen.style.width = (64*factor) + "px" 
	screen.style.height = (32*factor) + "px" 
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
	document.getElementById("dropRomMenu").blur()
	document.getElementById("controllerTooltip").setAttribute("data-tip", getControls(rom))
	const res = await fetch('roms/'+rom+'.ch8');
	const arrayBuffer = await res.arrayBuffer();
	const unit8 = new Uint8Array(arrayBuffer)
	CHIP8.reset()
	CHIP8.load(unit8);
	if (run == false) { toggleRun() }
}
window.loadRom = loadRom

function loadCustom() {
	let fileBlob = inputRom.files[0];
	let reader = new FileReader();
	reader.readAsArrayBuffer(fileBlob);
	reader.onload = (evt) => {
		const unit8 = new Uint8Array(evt.target.result);
		CHIP8.reset()
		CHIP8.load(unit8);
	}
	document.getElementById("closeCustom").click()
	romSelecter.innerHTML = fileBlob.name;
	document.getElementById("controllerTooltip").setAttribute("data-tip", getControls("Custom"))
	if (run == false) { toggleRun() }
}

inputRom.addEventListener("change", loadCustom)
dropArea.addEventListener("dragover", (e) =>{
	e.preventDefault();
})
dropArea.addEventListener("drop", (e) =>{
	e.preventDefault();
	inputRom.files = e.dataTransfer.files;
	loadCustom()
})


function showCustom() {
	document.getElementById("rom-modal").showModal()
}

function update()
{
	requestAnimationFrame(update);

	if(run == true) {

		for(let i = 0; i < stepsPerSec; i++){
			CHIP8.step()	
			if(debugCheck.checked)
				updateDebug(CHIP8)
		};
		
		CHIP8.update_timers()

	}
}
window.showCustom = showCustom

update();


