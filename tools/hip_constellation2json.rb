#!/bin/env ruby
# Usage: ruby hip_2json.rb > hip_constellations.json
# http://astronomy.webcrow.jp/hip/
require 'json'

constellations = {}
open(ARGV[0] || "hip_constellation_line.csv").read.lines.each{|line|
    row = line.chomp.split(',')
    hipId = row[0].to_i
    constellations[row[0]] = {name: row[0], lines: []} unless constellations[row[0]]
    constellations[row[0]][:lines] << row[1].to_i << row[2].to_i
}

constellations.values.each_with_index{|c,i|
    puts (i == 0 ? "[": ",") + JSON.generate(c)
}

puts "]"
