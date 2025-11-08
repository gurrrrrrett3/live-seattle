# shape file

## header

char[4] magic // AGEN | 53 48 41 50
u8 id
char[32] name
u32 shapeDataPointer
u32 shapeTablePointer
u32 tripTablePointer
u32 routeTablePointer

### bounding box data

u32 top
u32 bottom
u32 left
u32 right

### shape data

u16 lat
u16 long

### shape lookup table
u16 size

u8 id len
str[len] id
u8 tripId len
str[len] tripId
u32 offset // from start of file + shapeDataPointer
u16 count

### trip lookup table

