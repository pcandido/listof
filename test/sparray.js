const assert = require('assert');
const sinon = require('sinon');
const sparray = require('../src/sparray');

const eq = assert.equal;
const deq = assert.deepEqual;
const seq = assert.strictEqual;
const eqt = (expression) => eq(expression, true);
const eqf = (expression) => eq(expression, false);

const testNative = (func, req, res, resCompare) => {
  const callback = sinon.spy();
  const stub = sinon.stub(Array.prototype, func).returns(res);
  const arr = sparray.from(req)[func](callback);
  eq(stub.calledOnce, true, 'The native method was not called');
  deq(arr, resCompare);
  stub.restore();
};

describe('sparray', () => {

  describe('from', () => {

    it('should be called with no parameters', () => {
      deq(sparray.from().toArray(), []);
    });

    it('should accpet a single non-array-like element', () => {
      deq(sparray.from(1).toArray(), [1]);
      deq(sparray.from('a').toArray(), ['a']);
      deq(sparray.from({ a: 1 }).toArray(), [{ a: 1 }]);
      deq(sparray.from(true).toArray(), [true]);
    });

    it('should accept a single array-like element', () => {
      deq(sparray.from([]).toArray(), []);
      deq(sparray.from([1]).toArray(), [1]);
      deq(sparray.from(['a']).toArray(), ['a']);
      deq(sparray.from([{ a: 1 }]).toArray(), [{ a: 1 }]);
      deq(sparray.from([1, 2, 3]).toArray(), [1, 2, 3]);
      deq(sparray.from(['a', 1, false]).toArray(), ['a', 1, false]);
    });

    it('should accept a single list to be cloned', () => {
      deq(sparray.from(sparray.from()).toArray(), []);
      deq(sparray.from(sparray.from([1, 2, 3])).toArray(), [1, 2, 3]);
    });

    it('should accpet multiple elements', () => {
      deq(sparray.from(1, 2, 3).toArray(), [1, 2, 3]);
      deq(sparray.from([1], 2, '3', { a: 4 }).toArray(), [[1], 2, '3', { a: 4 }]);
      deq(sparray.from([], []).toArray(), [[], []]);
    });

  });

  describe('range', () => {

    it('should throws an exception if no param is provided', () => {
      assert.throws(() => { sparray.range() }, Error);
    })

    it('should build an array from 0 to n (exclusive) for a given n param', () => {
      deq(sparray.range(0).toArray(), []);
      deq(sparray.range(3).toArray(), [0, 1, 2]);
      deq(sparray.range(-3).toArray(), [0, -1, -2]);
    });

    it('should build an array from n to m (exclusive) for a given n and m params', () => {
      deq(sparray.range(3, 3).toArray(), []);
      deq(sparray.range(0, 3).toArray(), [0, 1, 2]);
      deq(sparray.range(3, 6).toArray(), [3, 4, 5]);
      deq(sparray.range(-3, 3).toArray(), [-3, -2, -1, 0, 1, 2]);
      deq(sparray.range(3, -3).toArray(), [3, 2, 1, 0, -1, -2]);
    });

    it('should build an array from n to m (exclusive), incremented by i for a given n, m and i params', () => {
      deq(sparray.range(5, 10, 1).toArray(), [5, 6, 7, 8, 9]);
      deq(sparray.range(5, 10, 2).toArray(), [5, 7, 9]);
      deq(sparray.range(5, 11, 2).toArray(), [5, 7, 9]);
      deq(sparray.range(11, 5, -2).toArray(), [11, 9, 7]);
    });

    it('should throw an exception if the direction of range does not match the direction of increment', () => {
      assert.throws(() => { sparray.range(5, 10, -1) }, Error);
      assert.throws(() => { sparray.range(10, 5, 1) }, Error);
    });

  });

  describe('fillOf(n, value)', () => {

    it('should generate a sparray of "n" "value" elements', () => {
      deq(sparray.fillOf(3, 1).toArray(), [1, 1, 1]);
      deq(sparray.fillOf(3).toArray(), [undefined, undefined, undefined]);
      deq(sparray.fillOf(1, 1).toArray(), [1]);
      deq(sparray.fillOf(0, 1).toArray(), []);
      deq(sparray.fillOf(-1, 1).toArray(), []);
    });

    it('should throw an exception if n was not a number', () => {
      assert.throws(() => { sparray.fillOf('asdf', 1) });
    });

  });

  describe('fromSet', () => {

    it('should build a sparray from set', () => {
      deq(sparray.fromSet(new Set([])).toArray(), []);
      deq(sparray.fromSet(new Set([1, 2, 3])).toArray(), [1, 2, 3]);
      deq(sparray.fromSet(new Set([1, 2, 3, 1, 2, 3])).toArray(), [1, 2, 3]);
    });

  });

  describe('empty', () => {

    it('should build an empty sparray', () => {
      deq(sparray.empty().toArray(), []);
    });

  });

  describe('isSparray()', () => {

    it('should return true for sparrays', () => {
      eqt(sparray.isSparray(sparray.from(1, 2, 3)));
      eqt(sparray.isSparray(sparray.range(3)));
    });

    it('should return false for non-sparrays', () => {
      eqf(sparray.isSparray(1));
      eqf(sparray.isSparray([1, 2, 3]));
    });

  });

  describe('toArray()', () => {

    it('should return the raw stored data', () => {
      const a = sparray.from();
      a._data = [1, 2, 3];  //hard-coded to assert toArray without depends to the constructor
      deq(a.toArray(), [1, 2, 3]);
    });

    it('changes on returned raw data should not impact the sparray', () => {
      const a = sparray.from(1, 2, 3);
      const b = a.toArray();
      b.push(4);
      deq(a.toArray(), [1, 2, 3]);
      deq(b, [1, 2, 3, 4]);
    });

  });

  describe('get(i)', () => {

    it('should return an element by index', () => {
      const ad = sparray.from(1, 2, 3);
      eq(ad.get(1), 2);
      eq(ad.get(0), 1);
    });

    it('should return elements backwards for negative indices', () => {
      const ad = sparray.from(1, 2, 3);
      eq(ad.get(-1), 3);
      eq(ad.get(-2), 2);
    });

    it('should return undefined for out of bound indices', () => {
      seq(sparray.from(1, 2, 3).get(5), undefined);
      seq(sparray.from(1, 2, 3).get(-5), undefined);
    });
  });

  describe('keys()', () => {

    it('should call the native method', () => {
      testNative('keys', [1, 2, 3], undefined, undefined);
    });

    it('should return an iterator', () => {
      const sp = sparray.from(1, 2, 3, 4, 5);
      const ir = sp.keys();
      eq(ir.next().value, 0);
      eq(ir.next().value, 1);
      eqf(ir.next().done);
    });

  });

  describe('values()', () => {

    it('should call the native method', () => {
      testNative('values', [1, 2, 3], undefined, undefined);
    });

    it('should return an iterator', () => {
      const sp = sparray.from(1, 2, 3, 4, 5);
      const ir = sp.values();
      eq(ir.next().value, 1);
      eq(ir.next().value, 2);
      eqf(ir.next().done);
    });

  });

  describe('entries()', () => {

    it('should call the native method', () => {
      testNative('entries', [1, 2, 3], undefined, undefined);
    });

    it('should return an iterator', () => {
      const sp = sparray.from(1, 2, 3, 4, 5);
      const ir = sp.entries();
      deq(ir.next().value, [0, 1]);
      deq(ir.next().value, [1, 2]);
      eqf(ir.next().done);
    });

  });

  describe('length', () => {

    it('should return the size of the sparray', () => {
      eq(sparray.from().length, 0);
      eq(sparray.from(1, 2, 3).length, 3);
      eq(sparray.from([1, 2, 3]).length, 3);
    });

  });

  describe('size()', () => {

    it('should return the size of the sparray', () => {
      eq(sparray.from().size(), 0);
      eq(sparray.from(1, 2, 3).size(), 3);
      eq(sparray.from([1, 2, 3]).size(), 3);
    });

  });


  describe('count(filterFn, thisArg)', () => {

    it('should return the size of the sparray if no filterFn is provided', () => {
      eq(sparray.from().count(), 0);
      eq(sparray.from(1, 2, 3).count(), 3);
      eq(sparray.from([1, 2, 3]).count(), 3);
    });

    it('should count only filtered elements if a filterFn is provided', () => {
      eq(sparray.from(1, 2, 3, 4).count(a => a % 2), 2);
      eq(sparray.from(1, 2, 3, 4).count(a => false), 0);
      eq(sparray.from(1, 2, 3, 4).count(a => true), 4);
      eq(sparray.from(10, 20, 30, 40).count((a, i) => a == 10), 1);
      eq(sparray.from(10, 20, 30, 40).count((a, i) => i == 1), 1);
      eq(sparray.from(10, 20, 30, 40).count((a, i, s) => s.get(i) == a), 4);
    });

  });

  describe('distinct()', () => {

    it('should remove all duplicates', () => {
      deq(sparray.from().distinct().toArray(), []);
      deq(sparray.from(1).distinct().toArray(), [1]);
      deq(sparray.from(1, 2, 3).distinct().toArray(), [1, 2, 3]);
      deq(sparray.from(1, 1, 2, 2, 3, 3).distinct().toArray(), [1, 2, 3]);
      deq(sparray.from(1, 2, 3, 1, 2, 3).distinct().toArray(), [1, 2, 3]);
    });

  });

  describe('map(mapFn, thisArg)', () => {

    it('should call the native method', () => {
      testNative('map', [1, 2, 3], [1, 2, 3], sparray.from(1, 2, 3));
    });

    it('should transform the elements according to the function', () => {
      deq(sparray.from().map(a => a).toArray(), []);
      deq(sparray.from(1, 2, 3).map(a => a).toArray(), [1, 2, 3]);
      deq(sparray.from(1, 2, 3).map(a => a * 2).toArray(), [2, 4, 6]);
    });

  });

  describe('reduce(reduceFn, thisArg)', () => {

    it('should call the native method', () => {
      testNative('reduce', [1, 2, 3], 1, 1);
    });

    it('should reduce the elements according to the function', () => {
      eq(sparray.from(1, 2, 3).reduce((a, b) => a), 1);
      eq(sparray.from(1, 2, 3).reduce((a, b) => a + b, 5), 11);
      eq(sparray.from(120, 20, 2).reduce((a, b) => a / b), 3);
    });

    it('should throw exception if sparray is empty', () => {
      assert.throws(() => { sparray.from().reduce((a, b) => a + b) });
    });

  });

  describe('reduceRight(reduceFn, thisArg)', () => {

    it('should call the native method', () => {
      testNative('reduceRight', [1, 2, 3], 1, 1);
    });

    it('should reduce the elements according to the function', () => {
      eq(sparray.from(1, 2, 3).reduceRight((a, b) => a), 3);
      eq(sparray.from(1, 2, 3).reduceRight((a, b) => a + b, 5), 11);
      eq(sparray.from(2, 20, 120).reduceRight((a, b) => a / b), 3);
    });

    it('should throw exception if sparray is empty', () => {
      assert.throws(() => { sparray.from().reduceRight((a, b) => a + b) });
    });

  });

  describe('filter(filterFn, thisArg)', () => {

    it('should call the native method', () => {
      testNative('filter', [1, 2, 3], [1, 3], sparray.from(1, 3));
    });

    it('should filter the elements according to the function', () => {
      deq(sparray.from(1, 2, 3).filter(a => a % 2).toArray(), [1, 3]);
    });

  });

  describe('flatMap(mapFn, thisArg)', () => {

    it('should transform the elements according to the function and flatten the result', () => {
      deq(sparray.from().flatMap(a => a).toArray(), []);
      deq(sparray.from(1, 2, 3).flatMap(a => a).toArray(), [1, 2, 3]);
      deq(sparray.from(1, 2, 3).flatMap(a => sparray.range(a)).toArray(), [0, 0, 1, 0, 1, 2]);
      deq(sparray.from(1, 2, 3).flatMap(a => sparray.range(a).toArray()).toArray(), [0, 0, 1, 0, 1, 2]);
    });

  });

  describe('flatten(depth)', () => {

    it('should flat nested sparrays or arrays in the main sparray', () => {
      deq(sparray.from([1, 2], [3, 4]).flatten().toArray(), [1, 2, 3, 4]);
      deq(sparray.from([1, 2], []).flatten().toArray(), [1, 2]);
      deq(sparray.from([1, [2]], sparray.from([3, 4])).flatten().toArray(), [1, [2], 3, 4]);
    });

    it('should flat deep nested sparrays and arrays', () => {
      deq(sparray.from([1, [2]], sparray.from([3, [[4], 5]])).flatten(0).toArray(), [[1, [2]], sparray.from([3, [[4], 5]])]);
      deq(sparray.from([1, [2]], sparray.from([3, [[4], 5]])).flatten(1).toArray(), [1, [2], 3, [[4], 5]]);
      deq(sparray.from([1, [2]], sparray.from([3, [[4], 5]])).flatten(2).toArray(), [1, 2, 3, [4], 5]);
      deq(sparray.from([1, [2]], sparray.from([3, [[4], 5]])).flatten(3).toArray(), [1, 2, 3, 4, 5]);
      deq(sparray.from([1, [2]], sparray.from([3, [[4], 5]])).flatten(4).toArray(), [1, 2, 3, 4, 5]);
    });

  });

  describe('join(separator, thisArg)', () => {

    it('should join the elements as a string', () => {
      eq(sparray.from().join(), '');
      eq(sparray.from(1, 2, 3).join(), '1,2,3');
      eq(sparray.from(1, 2, 3).join(', '), '1, 2, 3');
    });

    it('should join the elements as a string using a function to determine separator', () => {
      eq(sparray.from().join((fromStart, fromEnd) => ','), '');
      eq(sparray.from(1, 2, 3).join((fromStart, fromEnd) => fromEnd == 0 ? ' and ' : ', '), '1, 2 and 3');
    });

  })

  describe('forEach(forEachFn, thisArg)', () => {

    it('should call the native method', () => {
      testNative('forEach', [1, 2, 3], undefined, undefined)
    });

    it('should iterate the elements of sparray', () => {
      const sp = sparray.from({ a: 1 }, { a: 2 }, { a: 3 });
      sp.forEach((a, i) => a.a = i);
      deq(sp, sparray.from({ a: 0 }, { a: 1 }, { a: 2 }));
    });

  })

  describe('some(someFn, thisArg)', () => {

    it('should call the native method', () => {
      testNative('some', [1, 2, 3], true, true)
    });

    it('should return true if some element matches the condiction of someFn', () => {
      eqf(sparray.from().some(a => true));
      eqt(sparray.from(1, 2, 3).some(a => true));
      eqf(sparray.from(1, 2, 3).some(a => false));
      eqt(sparray.from(1, 2, 3).some(a => a === 2));
    });

  })

  describe('every(everyFn, thisArg)', () => {

    it('should call the native method', () => {
      testNative('every', [1, 2, 3], true, true)
    });

    it('should return true if every element matches the condiction of everyFn', () => {
      eqt(sparray.from().every(a => true));
      eqt(sparray.from(1, 2, 3).every(a => true));
      eqf(sparray.from(1, 2, 3).every(a => false));
      eqf(sparray.from(1, 2, 3).every(a => a === 2));
      eqt(sparray.from(1, 2, 3).every(a => a < 10));
    });

  })

  describe('concat(...toCpncat)', () => {

    it('should concat other sparrays', () => {
      deq(sparray.from(1, 2, 3).concat().toArray(), [1, 2, 3]);
      deq(sparray.from(1, 2, 3).concat(sparray.from()).toArray(), [1, 2, 3]);
      deq(sparray.from(1, 2, 3).concat(sparray.from(4, 5, 6)).toArray(), [1, 2, 3, 4, 5, 6]);
      deq(sparray.from(1, 2, 3).concat(sparray.from(4), sparray.from(5, 6)).toArray(), [1, 2, 3, 4, 5, 6]);
    });

    it('should concat other arrays', () => {
      deq(sparray.from(1, 2, 3).concat([]).toArray(), [1, 2, 3]);
      deq(sparray.from(1, 2, 3).concat([4, 5, 6]).toArray(), [1, 2, 3, 4, 5, 6]);
      deq(sparray.from(1, 2, 3).concat([4], [5, 6]).toArray(), [1, 2, 3, 4, 5, 6]);
    });

    it('should concat other elements', () => {
      deq(sparray.from(1, 2, 3).concat(4, 5, 6).toArray(), [1, 2, 3, 4, 5, 6]);
      deq(sparray.from(1, 2, 3).concat(4, [5, 6]).toArray(), [1, 2, 3, 4, 5, 6]);
    });

    it('should not change the original sparray', () => {
      const a = sparray.from(1, 2, 3);
      const b = sparray.from(4, 5, 6);
      const c = a.concat(b);

      deq(a.toArray(), [1, 2, 3])
      deq(b.toArray(), [4, 5, 6])
      deq(c.toArray(), [1, 2, 3, 4, 5, 6])
    });

  });

  describe('find(findFn, thisArg)', () => {

    it('should call the native method', () => {
      testNative('find', [1, 2, 3], 2, 2)
    });

    it('should return the first element that satisfy the findFn', () => {
      seq(sparray.from().find(a => true), undefined);
      seq(sparray.from(1, 2, 3).find(a => true), 1);
      seq(sparray.from(1, 2, 3).find(a => false), undefined);
      seq(sparray.from(1, 2, 3).find(a => a === 2), 2);
    });

  })

  describe('findIndex(findFn, thisArg)', () => {

    it('should call the native method', () => {
      testNative('findIndex', [1, 2, 3], 2, 2)
    });

    it('should return the index of the first element that satisfy the findFn', () => {
      eq(sparray.from().findIndex(a => true), -1);
      eq(sparray.from(1, 2, 3).findIndex(a => true), 0);
      eq(sparray.from(1, 2, 3).findIndex(a => false), -1);
      eq(sparray.from(1, 2, 3).findIndex(a => a === 2), 1);
    });

  })

  describe('indexOf(searchElement)', () => {

    it('should call the native method', () => {
      testNative('indexOf', [1, 2, 3], 2, 2)
    });

    it('should return the first index of the searchElement in sparray', () => {
      eq(sparray.from().indexOf(1), -1);
      eq(sparray.from(1, 2, 3, 1, 2, 3).indexOf(1), 0);
      eq(sparray.from(1, 2, 3, 1, 2, 3).indexOf(2), 1);
      eq(sparray.from(1, 2, 3, 1, 2, 3).indexOf(5), -1);
    });

  })

  describe('lastIndexOf(searchElement)', () => {

    it('should call the native method', () => {
      testNative('lastIndexOf', [1, 2, 3], 2, 2)
    });

    it('should return the first index of the searchElement in sparray', () => {
      eq(sparray.from().lastIndexOf(1), -1);
      eq(sparray.from(1, 2, 3, 1, 2, 3).lastIndexOf(1), 3);
      eq(sparray.from(1, 2, 3, 1, 2, 3).lastIndexOf(2), 4);
      eq(sparray.from(1, 2, 3, 1, 2, 3).lastIndexOf(5), -1);
    });

  })

  describe('includes(value)', () => {

    it('should call the native method', () => {
      testNative('includes', [1, 2, 3], true, true)
    });

    it('should return true if the sparray contains the value', () => {
      eqf(sparray.from().includes(1));
      eqt(sparray.from(1, 2, 3).includes(1));
      eqt(sparray.from(1, 2, 3).includes(2));
      eqf(sparray.from(1, 2, 3).includes(5));
    });

  })

  describe('reverse()', () => {

    it('should build a new sparray with the elements in reverse order', () => {
      deq(sparray.from().reverse().toArray(), []);
      deq(sparray.from(1, 2, 3).reverse().toArray(), [3, 2, 1]);
    });

    it('the original sparray should not be changed', () => {
      const a = sparray.from(1, 2, 3);
      const b = a.reverse();

      deq(a.toArray(), [1, 2, 3]);
      deq(b.toArray(), [3, 2, 1]);
    });

  })

  describe('sort(sortFn, thisArg)', () => {

    it('should build a new sparray with the elements sorted', () => {
      deq(sparray.from().sort().toArray(), []);
      deq(sparray.from(3, 2, 1).sort().toArray(), [1, 2, 3]);
    });

    it('should sort by a custom sortFn', () => {
      deq(sparray.from(1, 2, 3).sort((a, b) => b - a).toArray(), [3, 2, 1]);
    });

    it('should not chage the original sparray', () => {
      const a = sparray.from(3, 2, 1);
      const b = a.sort();

      deq(a.toArray(), [3, 2, 1]);
      deq(b.toArray(), [1, 2, 3]);
    });

  })

  describe('sortBy(keyFn, reverse, thisArg)', () => {

    it('should build a new sparray with the elements sorted', () => {
      deq(sparray.from().sortBy(a => a).toArray(), []);
      deq(sparray.from(3, 2, 1).sortBy(a => a).toArray(), [1, 2, 3]);
      deq(sparray.from(3, 1, 2).sortBy(a => a, true).toArray(), [3, 2, 1]);
    });

    const sp = sparray.from(
      { id: 1, a: 2, b: 6, c: 'a' },
      { id: 2, a: 4, b: 2, c: 'b' },
      { id: 3, a: 1, b: 4, c: 'e' },
      { id: 4, a: 3, b: 6, c: 'd' },
      { id: 5, a: 4, b: 1, c: 'c' }
    );

    it('should sort complex objects by a property', () => {
      deq(sp.sortBy(a => a.a).map(a => a.id).toArray(), [3, 1, 4, 2, 5]);
      deq(sp.sortBy(a => a.b).map(a => a.id).toArray(), [5, 2, 3, 1, 4]);
      deq(sp.sortBy(a => a.c).map(a => a.id).toArray(), [1, 2, 5, 4, 3]);
    });

    it('should sort by a set of criteria', () => {
      deq(sp.sortBy(a => [a.a, a.b]).map(a => a.id).toArray(), [3, 1, 4, 5, 2]);
      deq(sp.sortBy(a => [a.a, a.c]).map(a => a.id).toArray(), [3, 1, 4, 2, 5]);
      deq(sp.sortBy(a => [a.b, a.c]).map(a => a.id).toArray(), [5, 2, 3, 1, 4]);
    });

  })

  describe('slice(start, end)', () => {

    it('should build a new sparray with the elements sliced', () => {
      deq(sparray.from().slice(1, 2).toArray(), []);
      deq(sparray.from(1, 2, 3, 4, 5).slice(1, 3).toArray(), [2, 3]);
    });

    it('should accept negative indexes to backward indexing', () => {
      deq(sparray.from(1, 2, 3, 4, 5).slice(1, -1).toArray(), [2, 3, 4]);
      deq(sparray.from(1, 2, 3, 4, 5).slice(-3, -1).toArray(), [3, 4]);
      deq(sparray.from(1, 2, 3, 4, 5).slice(-3, 5).toArray(), [3, 4, 5]);
    });

    it('should accept just one parameter', () => {
      deq(sparray.from(1, 2, 3, 4, 5).slice(1).toArray(), [2, 3, 4, 5]);
      deq(sparray.from(1, 2, 3, 4, 5).slice(-3).toArray(), [3, 4, 5]);
    });

  })

  describe('toString()', () => {

    it('should call the native method', () => {
      testNative('toString', [1, 2, 3], '[1,2,3]', '[1,2,3]')
    });

    it('should return the string representation of sparray and its elements', () => {
      eq(sparray.from().toString(), '');
      eq(sparray.from(1, 2, 3).toString(), '1,2,3');
      eq(sparray.from('a', 'b', 'c').toString(), 'a,b,c');
    });

  })

  describe('toLocaleString(locales,options)', () => {

    it('should call the native method', () => {
      testNative('toLocaleString', [1, 2, 3], '[1,2,3]', '[1,2,3]')
    });

    it('should return the string representation of sparray and its elements', () => {
      eq(sparray.from().toLocaleString(), '');
      eq(sparray.from(1, 2, 3).toLocaleString(), '1,2,3');
      eq(sparray.from('a', 'b', 'c').toLocaleString(), 'a,b,c');
      eq(sparray.from(new Date(2000, 01, 05, 10, 30, 00)).toLocaleString('en-US'), '2/5/2000, 10:30:00 AM');
    });

  })

  describe('isNumeric()', () => {

    it('should return true if all the elements are numeric', () => {
      eqt(sparray.from().isNumeric());
      eqt(sparray.from(1).isNumeric());
      eqt(sparray.from(1, 2, 3).isNumeric());
    });

    it('should return NaN if there is a non-number element', () => {
      eqf(sparray.from(1, 2, '3').isNumeric());
      eqf(sparray.from(1, 2, [3]).isNumeric());
      eqf(sparray.from(1, 2, { a: 3 }).isNumeric());
    });

  });


  describe('sum()', () => {

    it('should sum the elements of the sparray', () => {
      eq(sparray.from().sum(), 0);
      eq(sparray.from(1).sum(), 1);
      eq(sparray.from(2, 2, 5, 1).sum(), 10);
    });

    it('should return NaN if there is a non-number element', () => {
      eqt(isNaN(sparray.from(1, 2, '3').sum()));
      eqt(isNaN(sparray.from(1, 2, [3]).sum()));
      eqt(isNaN(sparray.from(1, 2, { a: 3 }).sum()));
    });

  });

  describe('avg()', () => {

    it('should calculate average of the elements of the sparray', () => {
      eq(sparray.from().avg(), undefined);
      eq(sparray.from(1).avg(), 1);
      eq(sparray.from(1, 2, 3, 4).avg(), 2.5);
    });

    it('should return NaN if there is a non-number element', () => {
      eqt(isNaN(sparray.from(1, 2, '3').avg()));
      eqt(isNaN(sparray.from(1, 2, [3]).avg()));
      eqt(isNaN(sparray.from(1, 2, { a: 3 }).avg()));
    });

  });

  describe('indexBy(keyFn, thisArg)', () => {

    it('should index elements by the key returned by keyFn', () => {
      deq(sparray.from().indexBy(a => a), {});
      deq(sparray.from(1, 2, 3).indexBy(a => a), { 1: 1, 2: 2, 3: 3 });
      deq(sparray.from({ a: 1 }, { a: 2 }, { a: 3 }).indexBy(a => a.a), { 1: { a: 1 }, 2: { a: 2 }, 3: { a: 3 } });
    });

    it('should not repeat elements, the last element of the same index should replace any other', () => {
      deq(sparray.from({ a: 1 }, { a: 2 }, { a: 3 }, { b: 2 }).indexBy(a => a.a || a.b), { 1: { a: 1 }, 2: { b: 2 }, 3: { a: 3 } });
    });

  });

  describe('groupBy(keyFn, thisArg)', () => {

    it('should group elements by the key returned by keyFn', () => {
      deq(sparray.from().groupBy(a => a), {});
      deq(sparray.from(1, 2, 3).groupBy(a => a), { 1: sparray.from(1), 2: sparray.from(2), 3: sparray.from(3) });
      deq(sparray.from({ a: 1 }, { a: 2 }, { a: 3 }).groupBy(a => a.a), { 1: sparray.from({ a: 1 }), 2: sparray.from({ a: 2 }), 3: sparray.from({ a: 3 }) });
    });

    it('should put the elements that repeat keys together', () => {
      deq(sparray.from({ a: 1 }, { a: 2 }, { a: 3 }, { b: 2 }).groupBy(a => a.a || a.b), { 1: sparray.from({ a: 1 }), 2: sparray.from({ a: 2 }, { b: 2 }), 3: sparray.from({ a: 3 }) });
      deq(sparray.from(1, 2, 3, 4, 5, 6).groupBy(a => a % 3), { 0: sparray.from(3, 6), 1: sparray.from(1, 4), 2: sparray.from(2, 5) });
    });

  });

  describe('isEmpty()', () => {

    it('should return true for empty sparrays', () => eqt(sparray.from().isEmpty()));
    it('should return false for non empty sparrays', () => eqf(sparray.from(1).isEmpty()));

  });

  describe('isNotEmpty()', () => {

    it('should return false for empty sparrays', () => eqf(sparray.from().isNotEmpty()));
    it('should return true for non empty sparrays', () => eqt(sparray.from(1).isNotEmpty()));

  });

  describe('sliding(size, step)', () => {

    const data = sparray.from(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

    it('should create partitions of the entered size', () => {
      deq(sparray.from().sliding(3).toArray(), []);
      deq(data.sliding(1).map(a => a.toArray()).toArray(), [[1], [2], [3], [4], [5], [6], [7], [8], [9], [10]]);
      deq(data.sliding(2).map(a => a.toArray()).toArray(), [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10]]);
      deq(data.sliding(3).map(a => a.toArray()).toArray(), [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);
    });

    it('should create partitions with the specified step', () => {
      deq(data.sliding(2, 1).map(a => a.toArray()).toArray(), [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10]]);
      deq(data.sliding(8, 5).map(a => a.toArray()).toArray(), [[1, 2, 3, 4, 5, 6, 7, 8], [6, 7, 8, 9, 10]]);
    });

    it('should throw error if size of step < 1', () => {
      assert.throws(() => data.sliding(0));
      assert.throws(() => data.sliding(-5));
      assert.throws(() => data.sliding(5, 0));
      assert.throws(() => data.sliding(5, -5));
    });

  });

  describe('clone()', () => {

    it('should clone the sparray', () => {
      deq(sparray.from().clone().toArray(), []);
      deq(sparray.from(1, 2, 3, 4).clone().toArray(), [1, 2, 3, 4]);
    });

  });

  describe('first(n)', () => {

    const sp = sparray.from(1, 2, 3, 4, 5);

    it('should return the first element if no param is provided', () => {
      eq(sp.first(), 1);
    });

    it('should return the first n element if param is provided', () => {
      deq(sp.first(1).toArray(), [1]);
      deq(sp.first(3).toArray(), [1, 2, 3]);
      deq(sp.first(20).toArray(), [1, 2, 3, 4, 5]);
    });

    it('should return undefined if sparray is empty', () => {
      eq(sparray.from().first(), undefined);
    })

  });

  describe('last(n)', () => {

    const sp = sparray.from(1, 2, 3, 4, 5);

    it('should return the last element if no param is provided', () => {
      eq(sp.last(), 5);
    });

    it('should return the last n element if param is provided', () => {
      deq(sp.last(1).toArray(), [5]);
      deq(sp.last(3).toArray(), [3, 4, 5]);
      deq(sp.last(20).toArray(), [1, 2, 3, 4, 5]);
    });

    it('should return undefined if sparray is empty', () => {
      eq(sparray.from().last(), undefined);
    })

  });

  describe('min()', () => {

    it('should get the min value of sparray', () => {
      eq(sparray.from().min(), undefined);
      eq(sparray.from(1).min(), 1);
      eq(sparray.from(1, 2, 3).min(), 1);
      eq(sparray.from(1, 2, 0, 3).min(), 0);
    });

  });

  describe('minBy(valueFn)', () => {

    it('should get the min value using the valueFn to get a comparable value', () => {
      const sp = sparray.from(
        { a: 3, b: 1, c: 'c' },
        { a: 2, b: 2, c: 'a' },
        { a: 1, b: 3, c: 'b' }
      );

      deq(sp.minBy(a => a.a).toArray(), [{ a: 1, b: 3, c: 'b' }]);
      deq(sp.minBy(a => a.b).toArray(), [{ a: 3, b: 1, c: 'c' }]);
      deq(sp.minBy(a => a.c).toArray(), [{ a: 2, b: 2, c: 'a' }]);
    })

    it('should return a sparray if more than one element has the min value', () => {
      const sp = sparray.from(
        { a: 1, b: 1, c: 'c' },
        { a: 2, b: 2, c: 'a' },
        { a: 1, b: 3, c: 'a' }
      );
      deq(sp.minBy(a => a.c).toArray(), [{ a: 2, b: 2, c: 'a' }, { a: 1, b: 3, c: 'a' }]);
      deq(sp.minBy(a => a.a).toArray(), [{ a: 1, b: 1, c: 'c' }, { a: 1, b: 3, c: 'a' }]);
    })

  });

  describe('max()', () => {

    it('should get the max value of sparray', () => {
      eq(sparray.from().max(), undefined);
      eq(sparray.from(1).max(), 1);
      eq(sparray.from(1, 2, 3).max(), 3);
      eq(sparray.from(3, 2, 0, 3).max(), 3);
    });

  });

  describe('maxBy(valueFn)', () => {

    it('should get the max value using the valueFn to get a comparable value', () => {
      const sp = sparray.from(
        { a: 3, b: 1, c: 'c' },
        { a: 2, b: 2, c: 'a' },
        { a: 1, b: 3, c: 'b' }
      );

      deq(sp.maxBy(a => a.a).toArray(), [{ a: 3, b: 1, c: 'c' }]);
      deq(sp.maxBy(a => a.b).toArray(), [{ a: 1, b: 3, c: 'b' }]);
      deq(sp.maxBy(a => a.c).toArray(), [{ a: 3, b: 1, c: 'c' }]);
    })

    it('should return a sparray if more than one element has the max value', () => {
      const sp = sparray.from(
        { a: 1, b: 1, c: 'c' },
        { a: 2, b: 2, c: 'a' },
        { a: 2, b: 3, c: 'c' }
      );
      deq(sp.maxBy(a => a.c).toArray(), [{ a: 1, b: 1, c: 'c' }, { a: 2, b: 3, c: 'c' }]);
      deq(sp.maxBy(a => a.a).toArray(), [{ a: 2, b: 2, c: 'a' }, { a: 2, b: 3, c: 'c' }]);
    })

  });

});
