import React, { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Flex } from '@strapi/design-system';
import { Field } from '@strapi/design-system';
import PropTypes from "prop-types";

import { getGlobalStyling } from './GlobalStyling';
import Configurator from './Configurator';
import MediaLib from '../MediaLib';

import { CKEditor } from '@ckeditor/ckeditor5-react';

const getClassicEditor = () => (typeof window !== 'undefined' && window.CKEDITOR ? window.CKEDITOR.ClassicEditor : null);

import sanitize from './utils/utils';
import { useField } from '@strapi/strapi/admin';

const strapiTheme = localStorage.getItem( 'STRAPI_THEME' ) || 'light';
const GlobalStyling = getGlobalStyling( strapiTheme );

const CKEditorInput = ( props ) => {
  const {
    attribute,
    name,
    disabled,
    labelAction,
    required,
    description,
    error,
    intlLabel } = props;
  const { onChange, value } = useField( name );
  const [ editorInstance, setEditorInstance ] = useState(false);
  const { formatMessage } = useIntl();
  const { maxLengthCharacters:maxLength, licenseKey, ...options } = attribute.options;
  const configurator = new Configurator( { options, maxLength, licenseKey } );
  const editorConfig = configurator.getEditorConfig();

  const wordCounter = useRef( null );

  const [ mediaLibVisible, setMediaLibVisible ] = useState( false );

  const handleToggleMediaLib = () => setMediaLibVisible( prev => !prev );

  const handleChangeAssets = assets => {
    let imageHtmlString = '';

    assets.map( asset => {
      if ( asset.mime.includes('image') ) {
        const url = sanitize( asset.url );
        const alt = sanitize( asset.alt );

        imageHtmlString += `<img src="${ url }" alt="${ alt }" />`;
      }
    } );

    const viewFragment = editorInstance.data.processor.toView( imageHtmlString );
    const modelFragment = editorInstance.data.toModel( viewFragment );
    editorInstance.model.insertContent( modelFragment );

    handleToggleMediaLib();
  };

  const ClassicEditor = getClassicEditor();

  return (
    <Field.Root
      name= {name }
      id={ name }
      // GenericInput calls formatMessage and returns a string for the error
      error={ error }
      hint={ description && formatMessage( description ) }
    >
      <Flex spacing={ 1 } alignItems="normal" style={ { 'flexDirection': 'column' } }>
        <Field.Label action={ labelAction } required={ required }>
          { intlLabel ? formatMessage( intlLabel ) : name }
        </Field.Label>
        <GlobalStyling />
        {ClassicEditor ? (
          <CKEditor
            editor={ ClassicEditor }
            disabled={ disabled }
            data={ value ?? '' }
            onReady={ ( editor ) => {
              if (editor.plugins.has( 'WordCount' )) {
                const wordCountPlugin = editor.plugins.get( 'WordCount' );
                const wordCountWrapper = wordCounter.current;
                if (wordCountWrapper) {
                  wordCountWrapper.innerHTML = '';
                  wordCountWrapper.appendChild( wordCountPlugin.wordCountContainer );
                }
              }

              if (editor.plugins.has( 'strapiMediaLib' )) {
                const mediaLibPlugin = editor.plugins.get( 'strapiMediaLib' );
                mediaLibPlugin.connect( handleToggleMediaLib );
              }

              setEditorInstance( editor );
            }}
            onChange={ ( event, editor ) => {
              const data = editor.getData();
              onChange( { target: { name, value: data } } );

              if (editor.plugins.has( 'WordCount' )) {
                const wordCountPlugin = editor.plugins.get( 'WordCount' );
                const numberOfCharacters = wordCountPlugin.characters;

                if ( numberOfCharacters > maxLength ) {
                  console.log( 'Too long' );
                }
              }
            }}
            config={ editorConfig }
          />
        ) : (
          <div style={{ padding: '20px', background: '#f6f6f9', border: '1px dashed #dcdce4', borderRadius: '4px', textAlign: 'center', color: '#4945ff' }}>
            Initializing CKEditor 5...
          </div>
        )}
        <div ref={ wordCounter }></div>
        <Field.Hint />
        <Field.Error />
      </Flex>
      <MediaLib isOpen={ mediaLibVisible } onChange={ handleChangeAssets } onToggle={ handleToggleMediaLib } />
    </Field.Root>
  );
};

CKEditorInput.propTypes = {
  attribute: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.object,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  labelAction: PropTypes.object,
  required: PropTypes.bool
};

export { CKEditorInput };
