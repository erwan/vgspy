task :default => [:xpi]

task :xpi do
  rm_f 'vgspy.xpi'
  `find chrome locale chrome.manifest install.rdf -type f \
   | egrep -v "(#|~)" | xargs zip vgspy.xpi`
end 
