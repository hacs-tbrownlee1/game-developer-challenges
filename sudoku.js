let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let startSudoku;
let currentSudoku;

canvas.width = 450;
canvas.height = 450;

document.getElementById("gen").addEventListener("click", main);
document.getElementById("drawPmarks").addEventListener("change", function() {
    drawSudoku(currentSudoku);
});

function main() {    
    let sudoku;

    requestAnimationFrame(function() {
        //These requestAnimationFrame calls are to give the computer time to show these messages
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "20px Arial";
        ctx.textBaseline = "top";
        ctx.fillText("Generating sudoku...", 0, 0);

        requestAnimationFrame(function() {
            //I've set the sudoku generator to terminate and return null if it's taking too long
            //In these cases, I will start it again.
            do {
                sudoku = makeSudoku();
            } while (!sudoku);

            requestAnimationFrame(function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = "20px Arial";
                ctx.textBaseline = "top";
                ctx.fillText("Emptying cells...", 0, 0);
                
                //Remove as many squares as possible
                requestAnimationFrame(function() {
                    depopulateSudoku(sudoku);

                    currentSudoku = sudoku;
                    startSudoku = sudoku;
                    drawSudoku(sudoku);
                });
            });
        });
    });
}

/*In order to handle the 3x3 boxes in Sudoku, I will make a box-based coordinate system.

First, to show you what I mean, I will show you the row/column coordinates.
Row axis:
0 0 0 0 0 0 0 0 0
1 1 1 1 1 1 1 1 1
2 2 2 2 2 2 2 2 2
3 3 3 3 3 3 3 3 3
4 4 4 4 4 4 4 4 4
5 5 5 5 5 5 5 5 5
6 6 6 6 6 6 6 6 6
7 7 7 7 7 7 7 7 7
8 8 8 8 8 8 8 8 8
Column axis:
0 1 2 3 4 5 6 7 8
0 1 2 3 4 5 6 7 8
0 1 2 3 4 5 6 7 8
0 1 2 3 4 5 6 7 8
0 1 2 3 4 5 6 7 8
0 1 2 3 4 5 6 7 8
0 1 2 3 4 5 6 7 8
0 1 2 3 4 5 6 7 8
0 1 2 3 4 5 6 7 8


Now for the box/item coordinate system.
Box axis:
0 0 0 1 1 1 2 2 2
0 0 0 1 1 1 2 2 2
0 0 0 1 1 1 2 2 2
3 3 3 4 4 4 5 5 5
3 3 3 4 4 4 5 5 5
3 3 3 4 4 4 5 5 5
6 6 6 7 7 7 8 8 8
6 6 6 7 7 7 8 8 8
6 6 6 7 7 7 8 8 8
Item axis:
0 1 2 0 1 2 0 1 2
3 4 5 3 4 5 3 4 5
6 7 8 6 7 8 6 7 8
0 1 2 0 1 2 0 1 2
3 4 5 3 4 5 3 4 5
6 7 8 6 7 8 6 7 8
0 1 2 0 1 2 0 1 2
3 4 5 3 4 5 3 4 5
6 7 8 6 7 8 6 7 8

Like the row/column coordinate system, the box/item coordinate system can uniquely identify
 any cell. The only difference is that it's a lot easier to work with when dealing with
 the 3x3 boxes in sudoku puzzles.
*/

//Convert cell index to box/item coordinates.
function index2boxitem(i) {
    let bb = 3 * Math.floor(i / 27) + Math.floor(i / 3) % 3;
    let bi = 3 * Math.floor(i / 9) % 9 + i % 3;
    return [bb, bi];
}

//Convert box/item coordinates to cell index.
function boxitem2index(bb, bi) {
    return 3 * bb + 6 * (bb - bb % 3) + bi + 2 * (bi - bi % 3);
}

function drawSudoku(sudoku) {
    canvas.width = 450;
    canvas.height = 450;

    ctx.clearRect(0, 0, canvas.width, canvas.height); //Clear the canvas

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let drawPmarks = document.getElementById("drawPmarks").checked;
    let pmarks = getPencilmarks(sudoku);

    //Draw each cell
    for (let i = 0; i < 81; i++) {
        //Find x and y of current cell
        let y = 50 * Math.floor(i / 9);
        let x = 50 * (i % 9);
        
        //Draw number inside cell if it isn't empty
        if (sudoku[i] >= 0) {
            //Convert the number to a string so that it can be passed to fillText and measureText
            let text = String(1 + sudoku[i]);

            //Set the font size and measure the text so I can center it horizontally
            ctx.font = "40px Arial";
            let textbox = ctx.measureText(text);

            //Draw the text
            ctx.fillStyle = "#000000";
            ctx.textBaseline = "middle"; //Easy way to center vertically
            ctx.fillText(text, x + (50 - textbox.width) / 2, y + 25);

        } else if (drawPmarks) {
            //If the cell is empty and the user wants to see the pencilmarks, draw them
            for (let n = 0; n < 9; n++) {
                if (pmarks[i] & (1 << n)) {
                    //Convert to string to pass to fillText and measureText
                    let text = String(1 + n);

                    let ny = 16 * Math.floor(n / 3);
                    let nx = 16 * (n % 3);
    
                    ctx.font = "12px Arial";
                    let textbox = ctx.measureText(text);

                    ctx.fillStyle = "#000000";
                    ctx.textBaseline = "middle"; //Easy way to center vertically
                    ctx.fillText(text, 1 + x + nx + (16 - textbox.width) / 2, y + ny + 10);
                }
            }
        }

        //Draw box around cell
        ctx.strokeStyle = "#cccccc";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 50, 50);
    }
    
    ctx.strokeStyle = "#000000";
    for (let x = 0; x < 450; x += 150) {
        for (let y = 0; y < 450; y += 150) {
            ctx.strokeRect(x, y, 150, 150);
        }
    }
    let imgURI = canvas.toDataURL("image/png");
    let downloadLink = document.getElementById("download");
    
    let fname = "";
    for (let i = 0; i < 81; i++) {
        if (sudoku[i] === -1) {
            fname += "_";
        } else {
            fname += String(sudoku[i]);
        }
    }

    downloadLink.download = fname;
    downloadLink.href = imgURI;
}

/*
Blank cells in a sudoku puzzle have possible values (e.g., Cell 9 could be a 3, 5, or 7).
These possible values are called pencilmarks, because they are traditionally marked in pencil
when solving a sudoku puzzle on paper.
I would like to store and use these pencilmarks, and for that I need an efficient data structure.
This is the data structure I have devised:

Each cell gets a 9-bit  integer that represents all the possible values of that cell.
If the Nth bit is 1, then N is a legal value of that cell.
e.g.,
if (pmarks[i] >> n & 1) {
    //sudoku[i] can be n
} else {
    //sudoku[i] cannot be n
}

Adding a pencilmark:
pmarks[i] |= 1 << n;

Erasing a pencilmark:
pmarks[i] &= ~(1 << n);

Checking if a pencilmark exists:
if (pmarks[i] & (1 << n)) {
    //sudoku[i] could be n
} else {
    //sudoku[i] cannot be n
}

*/

//Because making a true 9-bit integer would take too much effort in a world where everything
// is stored in 8-bit bytes, I'll use 16-bit integers and just ignore the last 7 bits.


//Count how many possible values a cell has
function countPencilmarks(pmark) {
    let count = 0;
    for (let n = 0; n < 9; n++) {
        if (pmark & (1 << n)) {
            count++;
        }
    }
    return count;
}

//Put the pencilmarks into an array
/* E.g.:
    0b000000011 --> [0, 1]
    0b100000000 --> [8]
    0b010001010 --> [1, 3, 7]
    0b111111111 --> [0, 1, 2, 3, 4, 5, 6, 7, 8]
    0b000000000 --> []
*/
function listPencilmarks(pmark) {
    let pmarkList = [];
    for (let n = 0; n < 9; n++) {
        if (pmark & (1 << n)) {
            pmarkList.push(n);
        }
    }
    return pmarkList;
}

function getPencilmarks(sudoku, cell = -1) {
    if (cell >= 0) {
        let i = cell; //I'm too lazy to fix all the places where I put 'i' instead of 'cell'

        //Get the pencilmarks of one cell
        let pmark = new Uint16Array(1);
        pmark[0] = 0b111111111;
        
        let r, c;
        r = Math.floor(cell / 9);
        for (c = 0; c < 9; c++) {
            let j = r * 9 + c;
            if (j !== cell && sudoku[j] >= 0) {
                pmark[0] &= ~(1 << sudoku[j]);
            }
        }

        c = i % 9;
        for (r = 0; r < 9; r++) {
            let j = r * 9 + c;
            if (j !== cell && sudoku[j] >= 0) {
                pmark[0] &= ~(1 << sudoku[j]);
            }
        }

        let [bb, bi] = index2boxitem(i);
        for (let bi2 = 0; bi2 < 9; bi2++) {
            if (bi2 !== bi) {
                let j = boxitem2index(bb, bi2);
                if (sudoku[j] >= 0) {
                    pmark[0] &= ~(1 << sudoku[j]);
                }
            }
        }

        return pmark[0];
    } else {
        //Get the pencilmarks of the whole sudoku
        let pmarks = new Uint16Array(81);

        //I'll start with all the pencilmarks on, and erase pencilmarks as I find impossible values
        //E.g., if there's a 3 in the same row, erase the 3 pencilmark in this cell.
        for (let i = 0; i < 81; i++) {
            pmarks[i] = 0b111111111;
        }
    
        for (let i = 0; i < 81; i++) {
            //If this cell isn't blank, erase the pencilmarks from cells in the same row, column, or box
            //E.g., if this cell is 3, erase 3 from the pencilmarks of all other cells in this row
            if (sudoku[i] >= 0) {
                let r, c;
    
                //Erase pencilmarks in this row
                r = Math.floor(i / 9);
                for (c = 0; c < 9; c++) {
                    let j = r * 9 + c;
                    if (j !== i) {
                        pmarks[j] &= ~(1 << sudoku[i]);
                    }
                }
    
                //Erase pencilmarks in this column
                c = i % 9;
                for (r = 0; r < 9; r++) {
                    let j = r * 9 + c;
                    if (j !== i) {
                        pmarks[j] &= ~(1 << sudoku[i]);
                    }
                }
    
                //Erase pencilmarks in this box
                let [bb, bi] = index2boxitem(i);
                for (let bi2 = 0; bi2 < 9; bi2++) {
                    if (bi2 !== bi) {
                        let j = boxitem2index(bb, bi2);
                        pmarks[j] &= ~(1 << sudoku[i]);
                    }
                }
            }
        }
        return pmarks;
    }
}


function makeSudoku() {
    //Start with a blank sudoku
    let sudoku = [
        -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1
    ];

    let i = 0;
    let pmarks = new Uint16Array(81);
    for (i = 0; i < 81; i++) {
        pmarks[i] = 0b111111111;
    }
    let count = 0;

    i = 0;
    while (i < 81 && count < 80000) {
        pmarks[i] &= getPencilmarks(sudoku, i);
        if (pmarks[i]) {
            //If there are any numbers that can go into the square
            let pmarkList = listPencilmarks(pmarks[i]);
            sudoku[i] = pmarkList[Math.floor(Math.random() * pmarkList.length)];
            i++;
        } else {
            pmarks[i] = 0b111111111;
            i--;
            pmarks[i] &= ~(1 << sudoku[i]);
        }
        count++;
    }

    if (sudoku.includes(-1)) {
        return null;
    } else {
        return sudoku;
    }
}


function depopulateSudoku(sudoku) {
    let order = [];
    for (let i = 0; i < 81; i++) {
        order.push(i);
    }
    //Shuffle the order in which squares are removed
    for (let i = order.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = order[i];
        order[i] = order[j];
        order[j] = temp;
    }

    let emptyCount = 0;

    for (let j = 0; j < 81; j++) {
        let i = order[j];

        let testSudoku = [...sudoku];

        //Try to empty a random square
        testSudoku[i] = -1;

        //If the resulting sudoku has multiple (or zero, somehow) solutions, put the number back.
        let count = solveSudoku(testSudoku);
        if (count === 1) {
            emptyCount++;
            sudoku[i] = -1;
        }
    }
}

//Count how many possible solutions a sudoku has
//This will be used to ensure that the sudoku generated has only one unique solution
function solveSudoku(sudoku, countSteps = false) {
    let stepCount = 0; //Count how many steps it took to arrive at a solution.

    /*This solver uses the Nishio method, which is a fancy name for recursive guessing.
      Normally I would implement this with a simple recursive function, but the extreme
      unseaworthiness of JavaScript's call stack has forced my hand.

      I shall show JavaScript how it's done.
    */
    let pmarks = getPencilmarks(sudoku);

    let tree = []; //This list is my "call stack".
    let count = 0;

    //Start off the "call stack" with the first call to the "recursive solver".
    let m = 0;
    for (let i = 0; i < 81; i++) {
        if (sudoku[i] === -1 && (sudoku[m] !== -1 || countPencilmarks(pmarks[i]) < countPencilmarks(pmarks[m]))) {
            m = i;
        }
    }
    tree.push({marks: [...listPencilmarks(pmarks[m])], cell: m, i: 0});
    
    //Now let's do some "recursion".
    let backtrack = false;
    do {
        //The "function" at the top of the "call stack" is the one that gets run.
        let t = tree.length - 1;

        if (tree[t].i >= tree[t].marks.length || backtrack) {
            /*
            If this iteration of the "recursive" solver function has tried all the possible values
             of its cell (or has some other reason to backtrack), then we "return" to the
             previous function in the stack.
            */
            backtrack = false;
            sudoku[tree[t].cell] = -1; //Make sure to clean up the mess we make
            tree.pop();
        } else {
            /*This is the main body of the "function".
               Each iteration of the solver is assigned a cell and a few possible guesses for
               that cell's value.
            */

            //Choose the first guess that hasn't already been guessed.
            sudoku[tree[t].cell] = tree[t].marks[tree[t].i];
            tree[t].i++;
            
            //If a solution has been found, increment the count and backtrack.
            if (!sudoku.includes(-1)) {
                count++;
                backtrack = true;
                continue;
            }

            pmarks = getPencilmarks(sudoku);

            //If an impass has been reached, it means we made a wrong guess at some point.
            // In these cases, the only thing to do is to backtrack.
            if (pmarks.includes(0b000000000)) {
                backtrack = true;
                continue;
            }

            //Find the cell with the fewest pencilmarks
            m = 0;
            for (let i = 0; i < 81; i++) {
                if (sudoku[i] === -1 && (sudoku[m] !== -1 || countPencilmarks(pmarks[i]) < countPencilmarks(pmarks[m]))) {
                    m = i;
                }
            }

            //"Recurse" deeper
            tree.push({marks: [...listPencilmarks(pmarks[m])], cell: m, i: 0});
        }
    } while (tree.length > 0 && (countSteps || count < 2));

    return count;
}
