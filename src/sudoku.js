/*! Javascript Sudoku v1.0.0 by Deniss Dubinin - https://github.com/denissdubinin/Javascript-Sudoku - Licensed MIT */

'use strict';
window.sudoku = {
    'Valve': 'Trilogy'
};

(function(window, $) {
    $.fn.Sudoku = function(options) {
        var defaults = {
                // TODO: ADD POSSIBILITY TO HAVE 2 SUDOKU ON 1 PAGE
                defaultSquare: 3, // TODO: GRID GENERATION
                dropTimerOnReset: true,
                markWrongCellsOnFly: false, // TODO: NOT IMPLEMENTED AT ALL
                markWrongCellsOnFinish: true,
                useTimer: true, // TODO: NOT IMPLEMENT AT ALL
                timerOnly: true, // TODO: WTF IS THIS? START ONLY WITH TIMER ENABLED?!?!?!
                sudokuMixIterations: 500
            },
            options = $.extend({}, defaults, options),
            sudokuTimer;

        create($(this));

        /**
         * Initialise script
         * @param {element} element 
         */
        function create(element) {
            generateGui(element);
            init();
        }

        /**
         * Initialise matrix generation and filling
         */
        function init() {
            toggleLoadingOverlay(true);
            generateMatrix();
            mixMatrix();
            prepareEmptyMatrix();
            fillGrid();
        }

        /**
         * Generates sudoku grid
         * @param {object} element 
         */
        function generateGui(element) {
            element.prepend('<label id="sudoku-minutes">00</label>:<label id="sudoku-seconds">00</label>');
            $('<table class="table table-bordered"></table>').appendTo(element);
            var i = 0,
                k = 0;

            while (i < 9) {
                var row = $('<tr class="sudoku-row"></tr>').appendTo(element.find('table'));
                while (k < 9) {
                    $('<td class="sudoku-cell"><input size="1" maxlength="1" onkeypress="return window.sudoku.listenKeyPress(event);"></td>').appendTo(row);
                    k++;
                }
                k = 0;
                i++;
            }

            initGridButtons(element);
        }

        /**
         * Listen keypresses inside sudoku grid
         * @param {object} event 
         */
        window.sudoku.listenKeyPress = function listenKeyPress(event) {
            var key = window.event ? event.keyCode : event.which;

            if ((event.keyCode == 8 || event.keyCode == 46) || (key > 47 && key < 58)) {
                return true;
            }
            
            return false;
        }

        function checkSudokuSuccess() {
            var emptyCells = $('.sudoku-cell').find('input').filter(function() {
                return this.value === '';
            });

            if (!emptyCells.length) {
                var filledMatrix = [];

                $('.sudoku .sudoku-row').each(function(index) {
                    filledMatrix.push([]);
                    $(this).find('input').each(function () {
                        filledMatrix[index].push(parseInt($(this).val()));
                    });
                });

                if (checkResults(filledMatrix, window.sudoku.fullMatrix)) {
                    $(document).trigger('startConfetti');
                } else {
                }
            }
        }

        /**
         * Toggle sudoku loading overlay
         * @param {bool} enable 
         */
        function toggleLoadingOverlay(enable) {
            if (enable) {
                $('.sudoku').addClass('loading');
            } else {
                $('.sudoku').removeClass('loading');
            }
        }

        /**
         * Initialise buttons to manage sudoku
         * @param {object} element
         */
        function initGridButtons(element) {
            var buttonGroup = $('<div>').addClass('btn-group'),
                startButton = $('<button>').addClass('btn btn-success btn-sm')
                    .attr('id', 'start-sudoku')
                    .text('Start'),
                resetButton = $('<button>').addClass('btn btn-danger btn-sm')
                    .attr('id', 'r-sudoku')
                    .text('Reset sudoku'),
                generateButton = $('<button>').addClass('btn btn-primary btn-sm')
                    .attr('id', 'gn-sudoku')
                    .text('Generate new sudoku');

            buttonGroup.append(startButton).append(resetButton)
                .append(generateButton);
            element.append(buttonGroup);

            $('#start-sudoku').on('click', function() {
                initTimer();
                $('#start-sudoku').prop('disabled', true);
            });
            $('#r-sudoku').on('click', function() {
                var popup = confirm('Are you sure?');
                if (popup == true) {
                    fillGrid();
                    $('.sudoku-cell').removeClass('invalid-cell');

                    if (options.dropTimerOnReset) {
                        resetTimer(false);
                    }
                }
            });
            $('#gn-sudoku').on('click', function() {
                var popup = confirm('Are you sure?');
                if (popup == true) {
                    $(document).trigger('stopConfetti');
                    $('.sudoku-cell input:disabled').prop('disabled', false);
                    $('#start-sudoku').prop('disabled', false);
                    $('.sudoku-cell').removeClass('invalid-cell');
                    resetTimer(true);
                    init();
                }
            });
        }

        /**
         * Initialise playing timer
         */
        function initTimer() {
            var minutesLabel = $('#sudoku-minutes'),
                secondsLabel = $('#sudoku-seconds'),
                totalSeconds = 0;

            sudokuTimer = setInterval(setTime, 1000);

            function setTime() {
                ++totalSeconds;
                secondsLabel.text(formatTime(totalSeconds % 60));
                minutesLabel.text(formatTime(parseInt(totalSeconds / 60)));
            }

            function formatTime(value) {
                var valString = value + '';
                if (valString.length < 2) {
                    return '0' + valString;
                }

                return valString;
            }
        }

        /**
         * Reset timer on new sudoku start on reset
         * @param {bool} stopTimer
         */
        function resetTimer(stopTimer) {
            $('#sudoku-minutes, #sudoku-seconds').text('00');

            clearInterval(sudokuTimer);

            if (!stopTimer) {
                initTimer();
            } else {
                $('#start-sudoku').prop('disabled', false);
            }
        }

        /**
         * Stop timer
         */
        function stopTimer() {
            clearInterval(sudokuTimer);
        }

        /**
         * Generate sudoku matrix
         */
        function generateMatrix() {
            var n = options.defaultSquare,
                result = [];
            for (let i = 0; i < 9; i++) {
                var row = [];
                for (let j = 0; j < 9; j++) {
                    var val = ((i * n + i / n + j) % (n * n) + 1);
                    row.push(parseInt(val));
                }
                result.push(row);
            }

            window.sudoku.fullMatrix = result;
        }

        /**
         * Fill sudoku grid with numbers
         */
        function fillGrid() {
            $('.sudoku-row').each(function(i) {
                $(this).find('td').each(function(j) {
                    var val = window.sudoku.emptyMatrix[i][j],
                        input = $(this).find('input');

                    input.val(val);

                    if (val !== '') {
                        input.prop('disabled', true);
                    }
                });
            });

            toggleLoadingOverlay(false);

            $('.sudoku-cell input').off('input');
            $('.sudoku-cell input').on('input', function () {
                checkSudokuSuccess();
            });
        }

        /**
         * Transpose matrix
         */
        function transposeMatrix() {
            window.sudoku.fullMatrix = window.sudoku.fullMatrix[0].map(function(i, k) {
                return window.sudoku.fullMatrix.map(function(array) {
                    return array[k]
                });
            });

            return window.sudoku.fullMatrix;
        }

        /**
         * Swap two random rows in matrix
         */
        function swapTwoRows() {
            var areaToSwap = Math.floor(Math.random() * options.defaultSquare),
                line1 = Math.floor(Math.random() * options.defaultSquare),
                line2 = Math.floor(Math.random() * options.defaultSquare),
                row1 = areaToSwap * options.defaultSquare + line1;

            while (line1 == line2) {
                line2 = Math.floor(Math.random() * options.defaultSquare);
            }

            var row2 = areaToSwap * options.defaultSquare + line2,
                oldRowData1 = window.sudoku.fullMatrix[row1],
                oldRowData2 = window.sudoku.fullMatrix[row2];

            window.sudoku.fullMatrix[row1] = oldRowData2;
            window.sudoku.fullMatrix[row2] = oldRowData1;

            return window.sudoku.fullMatrix;
        }

        /**
         * Swap two random columns in matrix
         */
        function swapTwoColumns() {
            transposeMatrix();
            swapTwoRows();
            transposeMatrix();
        }

        /**
         * Swap two random large rows (x3 rows) in matrix
         */
        function swapTwoLargeRows() {
            var areaToSwap1 = Math.floor(Math.random() * options.defaultSquare),
                areaToSwap2 = Math.floor(Math.random() * options.defaultSquare);

            while (areaToSwap1 == areaToSwap2) {
                areaToSwap2 = Math.floor(Math.random() * options.defaultSquare);
            }

            for (let i = 0; i < options.defaultSquare; i++) {
                var row1 = areaToSwap1 * options.defaultSquare + i,
                    row2 = areaToSwap2 * options.defaultSquare + i,
                    oldLargeRowData1 = window.sudoku.fullMatrix[row1],
                    oldLargeRowData2 = window.sudoku.fullMatrix[row2];
                window.sudoku.fullMatrix[row1] = oldLargeRowData2;
                window.sudoku.fullMatrix[row2] = oldLargeRowData1;
            }

            return window.sudoku.fullMatrix;
        }

        /**
         * Swap two random large columns (x3 columns) in matrix
         */
        function swapTwoLargeColumns() {
            transposeMatrix();
            swapTwoLargeRows();
            transposeMatrix();
        }

        /**
         * Randomly mix matrix rows and columns
         */
        function mixMatrix() {
            var t0 = performance.now(),
                logicFunctions = [
                    'transposeMatrix()',
                    'swapTwoRows()',
                    'swapTwoRows()', // to increase chanse to swap rows
                    'swapTwoColumns()',
                    'swapTwoColumns()', // to increase chanse to swap columns
                    'swapTwoLargeRows()',
                    'swapTwoLargeColumns()'
                ];
            let i = 0;

            while (i < options.sudokuMixIterations) {
                var randomFunction = Math.floor(Math.random() * logicFunctions.length);
                eval(logicFunctions[randomFunction]);
                i++;
            }

            var t1 = performance.now();
            window.sudoku.generationTime = ((t1 - t0) * 0.001).toFixed(5) + ' seconds.';
        }

        /**
         * Generate matrix with empty elements
         */
        function prepareEmptyMatrix() {
            window.sudoku.emptyMatrix = [];

            for (let i = 0; i < options.defaultSquare * options.defaultSquare; i++) {
                window.sudoku.emptyMatrix.push([]);
                for (let k = 0; k < options.defaultSquare * options.defaultSquare; k++) {
                    window.sudoku.emptyMatrix[i].push('');
                }
            }

            let iterator = 0;

            while (iterator < options.defaultSquare ** 4) {
                let i = Math.floor(Math.random() * (options.defaultSquare ** 2)),
                    j = Math.floor(Math.random() * (options.defaultSquare ** 2));
                if (window.sudoku.emptyMatrix[i][j] === '') {
                    iterator++;

                    if (Math.random() * 10 > 6){
                        window.sudoku.emptyMatrix[i][j] = window.sudoku.fullMatrix[i][j];
                    }
                }
            }
        }

        /**
         * Compare user filled matrix with generated matrix and mark wrong results
         * @param {array} userMatrix
         * @param {array} fullMatrix
         */
        function checkResults(userMatrix, fullMatrix) {
            let error = false;
            for (let i = 0; i < userMatrix.length; i++) {
                for (let j = 0; j < userMatrix.length; j++) {
                    var currentCell = $(`.sudoku-row:eq(${i}) .sudoku-cell:eq(${j})`);

                    if (userMatrix[i][j] !== fullMatrix[i][j]) {
                        error = true;
                        if (options.markWrongCellsOnFinish) {
                            currentCell.addClass('invalid-cell');
                        }
                    } else {
                        currentCell.removeClass('invalid-cell');
                    }
                }
            }

            if (error) {
                return false;
            }

            return true;
        }
    };
})(window, jQuery);
