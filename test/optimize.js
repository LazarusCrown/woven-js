const express = require('express');
const request = require('supertest');
const bodyParser = require('body-parser');
const woven = require('../index');
const expect = require('chai').expect;
const should = require('chai').should();
const options = require('../src/options');
const functions = require('./functions');

const app = express();

app.use(bodyParser.json());
app.use(woven.optimize);

describe('Optimize function tests', () => {

  describe('initial GET from connect function', () => {

    it('should respond with JSON', (done) => {
      request(app)
        .get('/__woven_first__')
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.header['content-type']).to.contain('application/json');
          done();
        });
      });

     // server should respond with defaults, assuming no dev configuration
    it('should respond with default options', (done) => {
      request(app)
        .get('/__woven_first__')
        .end((err, res) => {
          expect(res.body.alwaysServer).to.equal(false);
          expect(res.body.alwaysClient).to.equal(false);
          expect(res.body.dynamicMax).to.equal(500);
          expect(res.body.ping.length).to.equal(50);
          expect(res.body.maxThreads).to.equal(12);
          expect(res.body.fallback).to.equal('server');
          done();
        });
    });
  });

  describe('initial GET with developer settings', () => {

    describe('options.alwaysClient = true', () => {
      before(() => woven.configure(functions, { alwaysClient: true }));
      it('correct alwaysClient options', (done) => {
        request(app)
          .get('/__woven_first__')
          .end((err, res) => {
            expect(res.body.alwaysServer).to.equal(false);
            expect(res.body.alwaysClient).to.equal(true);
            expect(res.body.ping).to.equal(null);
            done();
          });
      });
    });

    describe('options.alwaysServer = true', () => {
      before(() => woven.configure(functions, { alwaysServer: true }));
      it('correct alwaysServer options', (done) => {
        request(app)
          .get('/__woven_first__')
          .end((err, res) => {
            expect(res.body.alwaysServer).to.equal(true);
            expect(res.body.alwaysClient).to.equal(false);
            expect(res.body.ping).to.equal(null);
            done();
          });
      });
    });
  });

  describe('responds to POST from woven.run function', () => {
    
    it('handles functions with one argument', (done) => {
      request(app)
        .post('/__woven__')
        .send({ funcName: 'addTen', payload: [50] })
        .end((err, res) => {
          expect(res.body).to.equal(60);
        });
      request(app)
        .post('/__woven__')
        .send({ funcName: 'nthFib', payload: [35] })
        .end((err, res) => {
          expect(res.body).to.equal(9227465);
          done();
        });
    });
  
    it('handles functions with more than one argument', (done) => {
      request(app)
        .post('/__woven__')
        .type('json')
        .send({ funcName: 'addThree', payload: [1, 2, 3] })
        .end((err, res) => {
          expect(res.body).to.equal(6);
        });
      request(app)
        .post('/__woven__')
        .type('json')
        .send({ funcName: 'addAll', payload: [1, 2, 3, 4, 5, 6, 7, 8, 9] })
        .end((err, res) => {
          expect(res.body).to.equal(45);
          done();
        })
    });
  });
});

// is it handling multiple arguments correctly???