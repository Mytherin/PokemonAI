from AppKit import NSApplication, NSImage, NSImageCurrentFrame, NSGIFFileType; import sys, os
import imghdr, struct

def get_image_size(fname):
    '''Determine the image type of fhandle and return its size.
    from draco'''
    with open(fname, 'rb') as fhandle:
        head = fhandle.read(24)
        if len(head) != 24:
            return
        if imghdr.what(fname) == 'png':
            check = struct.unpack('>i', head[4:8])[0]
            if check != 0x0d0a1a0a:
                return
            width, height = struct.unpack('>ii', head[16:24])
        elif imghdr.what(fname) == 'gif':
            width, height = struct.unpack('<HH', head[6:10])
        elif imghdr.what(fname) == 'jpeg':
            try:
                fhandle.seek(0) # Read 0xff next
                size = 2
                ftype = 0
                while not 0xc0 <= ftype <= 0xcf:
                    fhandle.seek(size, 1)
                    byte = fhandle.read(1)
                    while ord(byte) == 0xff:
                        byte = fhandle.read(1)
                    ftype = ord(byte)
                    size = struct.unpack('>H', fhandle.read(2))[0] - 2
                # We are at a SOFn block
                fhandle.seek(1, 1)  # Skip `precision' byte.
                height, width = struct.unpack('>HH', fhandle.read(4))
            except Exception: #IGNORE:W0703
                return
        else:
            return
        return width, height

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
    (width,height) = get_image_size(fName)
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
        image_width = width if width > height else height
        for i in range(frames.intValue()):
            v += '/tmp/frames/tmp%d.gif ' % (i + 1)
        v += " -tile x1 -geometry '%dx%d>+0+0' -alpha On -background \"rgba(0, 0, 0, 0.0)\" -quality 100 %s" % (image_width, image_width, fName.replace('gif', 'png'),)
        os.system(v)
