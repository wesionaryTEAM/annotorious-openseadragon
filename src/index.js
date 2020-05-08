import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom';
import Emitter from 'tiny-emitter';
import OpenSeadragonAnnotator from './OpenSeadragonAnnotator';
import { WebAnnotation } from '@recogito/recogito-client-core';

import '@recogito/recogito-client-core/themes/default';

export class AnnotoriousOSD {

  constructor(viewer) {
    this._app = React.createRef();
    
    this._emitter = new Emitter();

    const viewerEl = viewer.element;
    if (!viewerEl.style.position)
      viewerEl.style.position = 'relative';

    this.appContainerEl = document.createElement('DIV');
    viewerEl.appendChild(this.appContainerEl);

    ReactDOM.render(
      <OpenSeadragonAnnotator 
        ref={this._app}
        wrapperEl={viewerEl} 
        viewer={viewer} 
        onAnnotationSelected={this.handleAnnotationSelected}
        onAnnotationCreated={this.handleAnnotationCreated} 
        onAnnotationUpdated={this.handleAnnotationUpdated} 
        onAnnotationDeleted={this.handleAnnotationDeleted}
        onMouseEnterAnnotation={this.handleMouseEnterAnnotation}
        onMouseLeaveAnnotation={this.handleMouseLeaveAnnotation} />, this.appContainerEl);
  }

  handleAnnotationSelected = annotation => 
    this._emitter.emit('selectAnnotation', annotation.underlying);

  handleAnnotationCreated = annotation =>
    this._emitter.emit('createAnnotation', annotation.underlying);

  handleAnnotationUpdated = (annotation, previous) =>
    this._emitter.emit('updateAnnotation', annotation.underlying, previous.underlying);

  handleAnnotationDeleted = annotation =>
    this._emitter.emit('deleteAnnotation', annotation.underlying);

  handleMouseEnterAnnotation = (annotation, evt) =>
    this._emitter.emit('mouseEnterAnnotation', annotation.underlying, evt);

  handleMouseLeaveAnnotation = (annotation, evt) =>
    this._emitter.emit('mouseLeaveAnnotation', annotation.underlying, evt);

  /******************/               
  /*  External API  */
  /******************/  

  addAnnotation = annotation =>
    this._app.current.addAnnotation(new WebAnnotation(annotation));

  removeAnnotation = annotation =>
    this._app.current.removeAnnotation(new WebAnnotation(annotation));

  loadAnnotations = url => axios.get(url).then(response => {
    const annotations = response.data.map(a => new WebAnnotation(a));
    this._app.current.setAnnotations(annotations);
    return annotations;
  });

  setAnnotations = annotations => {
    const webannotations = annotations.map(a => new WebAnnotation(a));
    this._app.current.setAnnotations(webannotations);
  }

  getAnnotations = () => {
    const annotations = this._app.current.getAnnotations();
    return annotations.map(a => a._annotation);
  }

  on = (event, handler) =>
    this._emitter.on(event, handler);

  off = (event, callback) =>
    this._emitter.off(event, callback);

}

export const init = (viewer) => new AnnotoriousOSD(viewer);
