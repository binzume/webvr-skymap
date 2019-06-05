#!/bin/env ruby
# Usage: ruby hip_2json.rb > hip_stars.json
# http://astronomy.webcrow.jp/hip/
require 'json'

open(ARGV[0] || "hip_lite_major.txt").read.lines.each_with_index{|line,i|
    row = line.chomp.split(',')
    hipId = row[0].to_i
    ra = (360.0 / 24.0) * (row[1].to_f + row[2].to_f / 60.0 + row[3].to_f / 3600.0) * Math::PI / 180.0;
    dec = (row[4].to_i * 2 -1) * (row[5].to_f + row[6].to_f / 60.0 + row[7].to_f / 3600.0)  * Math::PI / 180.0;
    mag = row[8].to_f
    bvcol = 0 # TODO
    puts (i == 0 ? "[" : ",") + JSON.generate({id: hipId, ra: ra, dec:dec, mag: mag, bvcol: bvcol})
}
puts "]"
