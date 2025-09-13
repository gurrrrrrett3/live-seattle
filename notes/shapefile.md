# shape file

## header

char[4] magic // SHAP | 53 48 41 50
u32 lookupOffset

### bounding box data

u32 top
u32 bottom
u32 left
u32 right

### shape data

u16 lat
u16 long

### lookup table
u16 size

u8 id len
str[len] id
u32 offset // from start of file + 0x18
u16 count
