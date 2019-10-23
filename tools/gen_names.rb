#!/bin/env ruby -Ku
# Usage: ruby gen_names.rb > star_names.json

require 'json'

names = {}
open(ARGV[0] || "hip_proper_name.csv").read.lines{|line|
    row = line.chomp.split(',')
    c = {id: row[0].to_i, nameEn: row[1]}
    names[c[:nameEn]] = c
}

open(ARGV[0] || "star_name_ja.txt").read.lines{|line|
    row = line.chomp.split("\t")
    c = names[row[0]]
    if c && row[1] != ""
        c[:nameJa] = row[1]
    end
}

print "["
names.values.each_with_index{|c,i|
    print (i == 0 ? "": ",\n") + JSON.generate(c)
}
print "]\n"
