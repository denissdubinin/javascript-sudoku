/*! Javascript Sudoku v1.0.0 by Deniss Dubinin - https://github.com/denissdubinin/Javascript-Sudoku - Licensed MIT */

'use strict';
window.sudoku = {
    'Valve': 'Trilogy'
};

(function (window, $) {
    $.fn.Sudoku = function (options) {
        var defaults = {
                // TODO: ADD POSSIBILITY TO HAVE 2 SUDOKU ON 1 PAGE
                squareSize: 3, // TODO: GRID GENERATION
                dropTimerOnReset: true,
                markWrongCellsOnFly: false,
                markWrongCellsOnFinish: true,
                useTimer: true,
                timerOnly: true,
                useCustomButtons: false,
                sudokuMixIterations: 500
            },
            options = $.extend({}, defaults, options),
            sudokuTimer;

        create($(this));

        /**
         * Initialise script
         * @param {object} element 
         */
        function create(element) {
            element.addClass('sudoku');
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
            enableFields(false);
        }

        /**
         * Generates sudoku grid
         * @param {object} element 
         */
        function generateGui(element) {
            if (options.useTimer) {
                element.prepend('<label id="sudoku-minutes">00</label>:<label id="sudoku-seconds">00</label>');
            }

            $('<table class="table table-bordered"></table>').appendTo(element);
            var i = 0,
                k = 0;

            while (i < options.squareSize ** 2) {
                var row = $('<tr class="sudoku-row"></tr>').appendTo(element.find('table'));
                while (k < options.squareSize ** 2) {
                    $('<td class="sudoku-cell"><input size="1" maxlength="1" onkeypress="return window.sudoku.listenKeyPress(event);"></td>').appendTo(row);
                    k++;
                }
                k = 0;
                i++;
            }

            enableFields(false);
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

        /**
         * Validate sudoku and mark invalid cells
         * @param {object} element
         */
        function validateSudoku(element) {
            var emptyCells = $('.sudoku-cell').find('input').filter(function () {
                return this.value === '';
            });

            if (options.markWrongCellsOnFly) {
                var cell = $(element).parent(),
                    rowPos = cell.parent().index(),
                    colPos = cell.index();

                if (parseInt($(element).val()) === window.sudoku.fullMatrix[rowPos][colPos] ||
                    $(element).val() === ''
                ) {
                    cell.removeClass('invalid-cell');
                } else {
                    cell.addClass('invalid-cell');
                }
            }

            if (options.markWrongCellsOnFinish && !emptyCells.length) {
                var filledMatrix = [];

                $('.sudoku .sudoku-row').each(function (index) {
                    filledMatrix.push([]);
                    $(this).find('input').each(function () {
                        filledMatrix[index].push(parseInt($(this).val()));
                    });
                });

                if (checkResults(filledMatrix, window.sudoku.fullMatrix)) {
                    $(document).trigger('sudoku.success.on');
                }
            }
        }

        /**
         * Toggle sudoku loading overlay | TODO
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
            if (!options.useCustomButtons) {
                var buttonGroup = $('<div>').addClass('btn-group'),
                    resetButton = $('<button>').addClass('btn btn-danger btn-sm')
                    .attr('id', 'r-sudoku').text('Reset sudoku'),
                    generateButton = $('<button>').addClass('btn btn-primary btn-sm')
                    .attr('id', 'gn-sudoku').text('Generate new sudoku');

                if (options.useTimer) {
                    var startButton = $('<button>').addClass('btn btn-success btn-sm')
                        .attr('id', 'start-sudoku').text('Start');

                    buttonGroup.append(startButton);
                }

                buttonGroup.append(resetButton).append(generateButton);
                element.append(buttonGroup);
            }

            $('body').on('click', '#start-sudoku', function () {
                if (options.useTimer) {
                    initTimer();
                }

                enableFields(true);
                startButton.prop('disabled', true);
            });

            $('body').on('click', '#r-sudoku', function () {
                var popup = confirm('Are you sure?');
                if (popup == true) {
                    fillGrid();
                    $('.sudoku-cell').removeClass('invalid-cell');

                    if (options.useTimer && options.dropTimerOnReset) {
                        resetTimer(false);
                    }
                }
            });

            $('body').on('click', '#gn-sudoku', function () {
                var popup = confirm('Are you sure?');
                if (popup == true) {
                    $(document).trigger('sudoku.success.off');
                    $('.sudoku-cell input:disabled:not(.default-cell)').prop('disabled', false);
                    $('.sudoku-cell').removeClass('invalid-cell');
                    $('.sudoku-cell input.default-cell').removeClass('default-cell');

                    if (options.useTimer) {
                        $('#start-sudoku:not(.default-cell)').prop('disabled', false);
                        resetTimer(true);
                    }

                    init();
                }
            });
        }

        /**
         * Toggle input fields
         * Triggered only if options.timerOnly === true and options.useTimer === true
         * @param {bool} enable 
         */
        function enableFields(enable) {
            if (!options.timerOnly || !options.useTimer) {
                return;
            }

            if (enable) {
                $('.sudoku-cell input:not(.default-cell)').prop('disabled', false);
            } else {
                $('.sudoku-cell input:not(.default-cell)').prop('disabled', true);
            }
        }

        /**
         * Initialise playing timer
         * Triggered only if options.useTimer === true
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
         * Triggered only if options.useTimer === true
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
            var n = options.squareSize,
                result = [];
            for (let i = 0; i < options.squareSize ** 2; i++) {
                var row = [];
                for (let j = 0; j < options.squareSize ** 2; j++) {
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
            $('.sudoku-row').each(function (i) {
                $(this).find('td').each(function (j) {
                    var val = window.sudoku.emptyMatrix[i][j],
                        input = $(this).find('input');

                    input.val(val);

                    if (val !== '') {
                        input.prop('disabled', true).addClass('default-cell');
                    }
                });
            });

            toggleLoadingOverlay(false);

            $('.sudoku-cell input').off('input').on('input', function (event) {
                validateSudoku(event.target);
            });
        }

        /**
         * Transpose matrix
         */
        function transposeMatrix() {
            window.sudoku.fullMatrix = window.sudoku.fullMatrix[0].map(function (i, k) {
                return window.sudoku.fullMatrix.map(function (array) {
                    return array[k]
                });
            });

            return window.sudoku.fullMatrix;
        }

        /**
         * Swap two random rows in matrix
         */
        function swapTwoRows() {
            var areaToSwap = Math.floor(Math.random() * options.squareSize),
                line1 = Math.floor(Math.random() * options.squareSize),
                line2 = Math.floor(Math.random() * options.squareSize),
                row1 = areaToSwap * options.squareSize + line1;

            while (line1 == line2) {
                line2 = Math.floor(Math.random() * options.squareSize);
            }

            var row2 = areaToSwap * options.squareSize + line2,
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
            var areaToSwap1 = Math.floor(Math.random() * options.squareSize),
                areaToSwap2 = Math.floor(Math.random() * options.squareSize);

            while (areaToSwap1 == areaToSwap2) {
                areaToSwap2 = Math.floor(Math.random() * options.squareSize);
            }

            for (let i = 0; i < options.squareSize; i++) {
                var row1 = areaToSwap1 * options.squareSize + i,
                    row2 = areaToSwap2 * options.squareSize + i,
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

            for (let i = 0; i < options.squareSize * options.squareSize; i++) {
                window.sudoku.emptyMatrix.push([]);
                for (let k = 0; k < options.squareSize * options.squareSize; k++) {
                    window.sudoku.emptyMatrix[i].push('');
                }
            }

            let iterator = 0;

            while (iterator < options.squareSize ** 4) {
                let i = Math.floor(Math.random() * (options.squareSize ** 2)),
                    j = Math.floor(Math.random() * (options.squareSize ** 2));
                if (window.sudoku.emptyMatrix[i][j] === '') {
                    iterator++;

                    if (Math.random() * 10 > 6) {
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
