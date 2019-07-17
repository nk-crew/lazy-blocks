
import LabelRow from './label';
import NameRow from './name';
import TypeRow from './type';
import ChoicesRow from './choices';
import AllowNullRow from './allow-null';
import AllowedMimeTypesRow from './allowed-mime-types';
import Multiple from './multiple';
import AlphaRow from './alpha';
import MinMaxStepRow from './min-max-step';
import DateTimePickerRow from './date-time-picker';
import MultilineRow from './multiline';
import DefaultRow from './default';
import CheckedRow from './checked';
import PlaceholderRow from './placeholder';
import HelpRow from './help';
import PlacementRow from './placement';
import HideIfNotSelectedRow from './hide-if-not-selected';
import SaveInMetaRow from './save-in-meta';

const { Component } = wp.element;

export default class settingsRows extends Component {
    render() {
        const {
            data,
        } = this.props;

        const rows = {
            label: LabelRow,
            name: NameRow,
            type: TypeRow,
            choices: ChoicesRow,
            allow_null: AllowNullRow,
            allowed_mime_types: AllowedMimeTypesRow,
            multiple: Multiple,
            alpha: AlphaRow,
            min_max_step: MinMaxStepRow,
            date_time_picker: DateTimePickerRow,
            multiline: MultilineRow,
            default: DefaultRow,
            checked: CheckedRow,
            placeholder: PlaceholderRow,
            help: HelpRow,
            placement: PlacementRow,
            hide_if_not_selected: HideIfNotSelectedRow,
            save_in_meta: SaveInMetaRow,
        };

        return Object.keys( rows ).map( ( i ) => {
            const Row = rows[ i ];
            let allow = true;

            // conditions to show rows.
            switch ( i ) {
            case 'choices':
            case 'allow_null':
                allow = data.type === 'select' ||
                        data.type === 'radio';
                break;
            case 'allowed_mime_types':
                allow = data.type === 'file';
                break;
            case 'multiple':
                allow = data.type === 'select';
                break;
            case 'alpha':
                allow = data.type === 'color';
                break;
            case 'min_max_step':
                allow = data.type === 'number' ||
                        data.type === 'range';
                break;
            case 'date_time_picker':
                allow = data.type === 'date_time';
                break;
            case 'multiline':
                allow = data.type === 'rich_text';
                break;
            case 'default':
                allow = data.type !== 'image' &&
                        data.type !== 'gallery' &&
                        data.type !== 'file' &&
                        data.type !== 'code_editor' &&
                        data.type !== 'inner_blocks' &&
                        data.type !== 'checkbox' &&
                        data.type !== 'toggle' &&
                        data.type !== 'repeater';
                break;
            case 'checked':
                allow = data.type === 'checkbox' || data.type === 'toggle';
                break;
            case 'placeholder':
                allow = data.type === 'text' ||
                        data.type === 'textarea' ||
                        data.type === 'number' ||
                        data.type === 'email' ||
                        data.type === 'password';
                break;
            case 'help':
                allow = data.type !== 'inner_blocks' &&
                        data.type !== 'repeater';
                break;
            case 'placement':
                allow = ! data.child_of;
                break;
            case 'hide_if_not_selected':
                allow = data.placement === 'content' ||
                        data.placement === 'both';
                break;
            case 'save_in_meta':
                allow = data.type !== 'inner_blocks' &&
                        ! data.child_of;
                break;
            }

            // don't show.
            if ( ! allow ) {
                return '';
            }

            return (
                <Row
                    key={ `settings-row-${ i }` }
                    { ...this.props }
                />
            );
        } );
    }
}
