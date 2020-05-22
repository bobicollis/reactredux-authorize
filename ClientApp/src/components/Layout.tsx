//import React, { Component } from 'react';
//import { Container } from 'reactstrap';
//import { NavMenu } from './NavMenu';

//export class Layout extends Component {
//  static displayName = Layout.name;

//  render () {
//    return (
//      <div>
//        <NavMenu />
//        <Container>
//          {this.props.children}
//        </Container>
//      </div>
//    );
//  }
//}

import * as React from 'react';
import { Container } from 'reactstrap';
import NavMenu from './NavMenu';

export default (props: { children?: React.ReactNode }) => (
    <React.Fragment>
        <NavMenu />
        <Container>
            {props.children}
        </Container>
    </React.Fragment>
);