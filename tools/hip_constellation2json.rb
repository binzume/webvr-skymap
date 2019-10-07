#!/bin/env ruby -Ku
# Usage: ruby hip_2json.rb > hip_constellations.json
# http://astronomy.webcrow.jp/hip/
# http://astronomy.webcrow.jp/constellation/boundary.csv

require 'json'

constellationIds = {}
names = {}
open(ARGV[0] || "constellation_name_utf8.csv").read.lines{|line|
    row = line.chomp.split(',')
    c = {name: row[1], nameEn: row[2], nameJa: row[3]}
    constellationIds[row[0]] = c
    names[c[:name]] = c
}

boundaries = {}
open(ARGV[0] || "boundary.csv").read.lines{|line|
    # id,ra1,dec1,ra2,dec2
    row = line.chomp.split(',')
    c = constellationIds[row[0]]
    boundaries[c[:name]] = (boundaries[c[:name]] || []) << [row[1].to_f % 360, row[2].to_f, row[3].to_f % 360, row[4].to_f]
}

# compaction
boundaries = boundaries.map{|k,b|
    [k, b.inject([]){|b2, a|
        if b2.last && b2.last[-2] == a[0] && b2.last.last == a[1]
            b2.last.concat(a[2..-1])
        else
            b2 << a
        end
        b2
    }]
}.to_h

constellations = {}
open(ARGV[0] || "hip_constellation_line.csv").read.lines.each{|line|
    row = line.chomp.split(',')
    hipId = row[0].to_i
    constellations[row[0]] = {name: row[0], nameEn: names[row[0]][:nameEn], nameJa: names[row[0]][:nameJa], lines: [], boundary: boundaries[row[0]] || []} unless constellations[row[0]]
    constellations[row[0]][:lines] << row[1].to_i << row[2].to_i
}

print "["
constellations.values.each_with_index{|c,i|
    print (i == 0 ? "": ",\n") + JSON.generate(c)
}
print "]\n"
