/**
 * CellFactory - Factory class for creating different types of bingo cells
 * Manages the creation and instantiation of field types based on word object data
 */
import TimerField from './TimerField.mjs';
import FieldCell from './FieldCell.mjs';
import FreeCell from './FreeCell.mjs';

export class CellFactory {
    static confettiColors = ['#42f569', '#23522d', '#05756a', '#6dd16d', '#0caae8'];

    static createCell(cell, wordObj, checkForBingo) {
        const type = wordObj.type || 'Field';
        
        switch (type) {
            case 'Timer':
                return new TimerField(cell, wordObj, this.confettiColors, checkForBingo);
            case 'Free':
                return new FreeCell(cell, wordObj, this.confettiColors, checkForBingo);
            case 'Field':
            default:
                return new FieldCell(cell, wordObj, this.confettiColors, checkForBingo);
        }
    }
}

export default CellFactory;
