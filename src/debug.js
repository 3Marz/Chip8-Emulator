
export const debugCheck = document.getElementById("debug-checkbox")

// toggle debug
debugCheck.onchange = function ()
{
	if(debugCheck.checked) {
		document.querySelector(".debug-container").hidden = false	
		document.querySelector("#stack").hidden = false
	} else {
		document.querySelector(".debug-container").hidden = true
		document.querySelector("#stack").hidden = true
	}
}

// Update Debug values
export function updateDebug(chip8)
{
	document.getElementById("PC").innerHTML = "0x"+(chip8.pc-2).toString(16);
	document.getElementById("I").innerHTML = "0x"+chip8.i.toString(16);
	document.getElementById("DT").innerHTML = "0x"+chip8.delay_timer;
	document.getElementById("SP").innerHTML = "0x"+chip8.sp.toString(16);
	document.getElementById("OC").innerHTML = "0x"+chip8.opcode.toString(16);

 
	document.getElementById("V0").innerHTML = "0x"+chip8.v[0].toString(16);
	document.getElementById("V1").innerHTML = "0x"+chip8.v[1].toString(16);
	document.getElementById("V2").innerHTML = "0x"+chip8.v[2].toString(16);
	document.getElementById("V3").innerHTML = "0x"+chip8.v[3].toString(16);
	document.getElementById("V4").innerHTML = "0x"+chip8.v[4].toString(16);
	document.getElementById("V5").innerHTML = "0x"+chip8.v[5].toString(16);
	
	document.getElementById("V6").innerHTML = "0x"+chip8.v[6].toString(16);
	document.getElementById("V7").innerHTML = "0x"+chip8.v[7].toString(16);
	document.getElementById("V8").innerHTML = "0x"+chip8.v[8].toString(16);
	document.getElementById("V9").innerHTML = "0x"+chip8.v[9].toString(16);
	document.getElementById("VA").innerHTML = "0x"+chip8.v[10].toString(16);

	document.getElementById("VB").innerHTML = "0x"+chip8.v[11].toString(16);
	document.getElementById("VC").innerHTML = "0x"+chip8.v[12].toString(16);
	document.getElementById("VD").innerHTML = "0x"+chip8.v[13].toString(16);
	document.getElementById("VE").innerHTML = "0x"+chip8.v[14].toString(16);
	document.getElementById("VF").innerHTML = "0x"+chip8.v[15].toString(16);

	document.getElementById("stack").innerHTML = "Stack : " + chip8.stack;
}

