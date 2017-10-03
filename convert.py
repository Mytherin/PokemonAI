from AppKit import NSApplication, NSImage, NSImageCurrentFrame, NSGIFFileType; import sys, os

dirname = sys.argv[1]
files = os.listdir(dirname)
for f in files:
    if '.gif' not in f: continue
    fName = os.path.join(dirname, f)
    tName=os.path.basename(fName)
    dir='/tmp/frames/'
    os.system('rm -rf %s && mkdir -p %s' % (dir,dir))
    app=NSApplication.sharedApplication() 
    img=NSImage.alloc().initWithContentsOfFile_(fName)
    if img:
        gifRep=img.representations()[0]
        frames=gifRep.valueForProperty_('NSImageFrameCount')
        if frames:
            for i in range(frames.intValue()):
                gifRep.setProperty_withValue_(NSImageCurrentFrame, i)
                gifRep.representationUsingType_properties_(NSGIFFileType, None).writeToFile_atomically_(dir + 'tmp' + str(i + 1).zfill(2) + '.gif', True)
        for i in range(9):
            os.system('mv %stmp0%d.gif %stmp%d.gif' % (dir, i + 1, dir, i+1))

        v = "montage "
        for i in range(frames.intValue()):
            v += '/tmp/frames/tmp%d.gif ' % (i + 1)
        v += " -tile x1 -geometry +0+0 -alpha On -background \"rgba(0, 0, 0, 0.0)\" -quality 100 %s" % (fName.replace('gif', 'png'),)
        os.system(v)
