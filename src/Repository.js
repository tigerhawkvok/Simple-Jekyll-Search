'use strict'
module.exports = {
  put: put,
  clear: clear,
  get: get,
  search: search,
  setOptions: setOptions
}

var FuzzySearchStrategy = require('./SearchStrategies/FuzzySearchStrategy')
var LiteralSearchStrategy = require('./SearchStrategies/LiteralSearchStrategy')

var data = []
var opt = {}
opt.fuzzy = false
opt.limit = 10
opt.searchStrategy = opt.fuzzy ? FuzzySearchStrategy : LiteralSearchStrategy

function put (data) {
  if (isObject(data)) {
    return addObject(data)
  }
  if (isArray(data)) {
    return addArray(data)
  }
  return undefined
}
function clear () {
  data.length = 0
  return data
}

function get () {
  return data
}

function isObject (obj) { return !!obj && Object.prototype.toString.call(obj) === '[object Object]' }
function isArray (obj) { return !!obj && Object.prototype.toString.call(obj) === '[object Array]' }

function addObject (_data) {
  data.push(_data)
  return data
}

function addArray (_data) {
  var added = []
  for (var i = 0; i < _data.length; i++) {
    if (isObject(_data[i])) {
      added.push(addObject(_data[i]))
    }
  }
  return added
}

function search (crit) {
  if (!crit) {
    return []
  }
  return findMatches(data, crit, opt.searchStrategy, opt)
}

function setOptions (_opt) {
  opt = _opt || {}

  opt.fuzzy = _opt.fuzzy || false
  opt.limit = _opt.limit || 10
  opt.searchStrategy = _opt.fuzzy ? FuzzySearchStrategy : LiteralSearchStrategy
}

function findMatches (data, crit, strategy, opt) {
  var entry, i, j, l, len, len1, len2, len3, m
  var matches = []
  var matchTitle = []
  var matchUrl = []
  var matchTags = []
  var dullMatches = []
  for (i = 0; i < data.length; i++) {
    var match = findMatchesInObject(data[i], crit, strategy, opt)
    if (match) {
      if (strategy.matches(data[i].title, crit)) matchTitle.push(match)
      else if (strategy.matches(data[i].tags, crit)) matchTags.push(match)
      else if (strategy.matches(data[i].url, crit)) matchUrl.push(match)
      else dullMatches.push(match)
    }
  }
  // Sort based on match
  for (i = 0, len = matchTitle.length; i < len; i++) {
    entry = matchTitle[i]
    if (matches.length < opt.limit) {
      matches.push(entry)
    } else {
      break
    }
  }

  for (j = 0, len1 = matchTags.length; j < len1; j++) {
    entry = matchTags[j]
    if (matches.length < opt.limit) {
      matches.push(entry)
    } else {
      break
    }
  }

  for (l = 0, len2 = matchUrl.length; l < len2; l++) {
    entry = matchUrl[l]
    if (matches.length < opt.limit) {
      matches.push(entry)
    } else {
      break
    }
  }

  for (m = 0, len3 = dullMatches.length; m < len3; m++) {
    entry = dullMatches[m]
    if (matches.length < opt.limit) {
      matches.push(entry)
    } else {
      break
    }
  }
  return matches
}

function findMatchesInObject (obj, crit, strategy, opt) {
  for (var key in obj) {
    if (!isExcluded(obj[key], opt.exclude) && strategy.matches(obj[key], crit)) {
      return obj
    }
  }
}

function isExcluded (term, excludedTerms) {
  var excluded = false
  excludedTerms = excludedTerms || []
  for (var i = 0; i < excludedTerms.length; i++) {
    var excludedTerm = excludedTerms[i]
    if (!excluded && new RegExp(term).test(excludedTerm)) {
      excluded = true
    }
  }
  return excluded
}
