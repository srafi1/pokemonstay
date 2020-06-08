package spawn

import (
	"log"
	"reflect"
)

type Bounds struct {
	MinLat float64
	MaxLat float64
	MinLng float64
	MaxLng float64
}

func (b *Bounds) NW() Coords {
	return Coords{
		Lat: b.MaxLat,
		Lng: b.MinLng,
	}
}

func (b *Bounds) NE() Coords {
	return Coords{
		Lat: b.MaxLat,
		Lng: b.MaxLng,
	}
}

func (b *Bounds) SW() Coords {
	return Coords{
		Lat: b.MinLat,
		Lng: b.MinLng,
	}
}

func (b *Bounds) SE() Coords {
	return Coords{
		Lat: b.MinLat,
		Lng: b.MaxLng,
	}
}

func (b *Bounds) InRange(s Coords) bool {
	return s.Lat >= b.MinLat &&
		s.Lat < b.MaxLat &&
		s.Lng >= b.MinLng &&
		s.Lng < b.MaxLng
}

func (b1 *Bounds) Collides(b2 Bounds) bool {
	return b1.MinLat < b2.MaxLat &&
		b1.MaxLat > b2.MinLat &&
		b1.MinLng < b2.MaxLng &&
		b1.MaxLng > b2.MinLng

}

type QuadTree struct {
	*Bounds
	children []Spawn
	NW       *QuadTree
	NE       *QuadTree
	SW       *QuadTree
	SE       *QuadTree
	full     bool
}

func NewQuadTree() *QuadTree {
	return &QuadTree{
		children: make([]Spawn, 0),
		Bounds: &Bounds{
			MinLat: -90,
			MaxLat: 90,
			MinLng: -90,
			MaxLng: 90,
		},
		full: false,
	}
}

func NewNWQuadTree(parent *QuadTree) *QuadTree {
	return &QuadTree{
		children: make([]Spawn, 0),
		Bounds: &Bounds{
			MinLat: (parent.MinLat + parent.MaxLat) / 2,
			MaxLat: parent.MaxLat,
			MinLng: parent.MinLng,
			MaxLng: (parent.MinLng + parent.MaxLng) / 2,
		},
		full: false,
	}
}

func NewNEQuadTree(parent *QuadTree) *QuadTree {
	return &QuadTree{
		children: make([]Spawn, 0),
		Bounds: &Bounds{
			MinLat: (parent.MinLat + parent.MaxLat) / 2,
			MaxLat: parent.MaxLat,
			MinLng: (parent.MinLng + parent.MaxLng) / 2,
			MaxLng: parent.MaxLng,
		},
		full: false,
	}
}

func NewSWQuadTree(parent *QuadTree) *QuadTree {
	return &QuadTree{
		children: make([]Spawn, 0),
		Bounds: &Bounds{
			MinLat: parent.MinLat,
			MaxLat: (parent.MinLat + parent.MaxLat) / 2,
			MinLng: parent.MinLng,
			MaxLng: (parent.MinLng + parent.MaxLng) / 2,
		},
		full: false,
	}
}

func NewSEQuadTree(parent *QuadTree) *QuadTree {
	return &QuadTree{
		children: make([]Spawn, 0),
		Bounds: &Bounds{
			MinLat: parent.MinLat,
			MaxLat: (parent.MinLat + parent.MaxLat) / 2,
			MinLng: (parent.MinLng + parent.MaxLng) / 2,
			MaxLng: parent.MaxLng,
		},
		full: false,
	}
}

func (q *QuadTree) GetSubtree(s Spawn) *QuadTree {
	if q.NW.InRange(s.Coords) {
		return q.NW
	} else if q.NE.InRange(s.Coords) {
		return q.NE
	} else if q.SW.InRange(s.Coords) {
		return q.SW
	} else if q.SE.InRange(s.Coords) {
		return q.SE
	} else {
		log.Println("nil subtree for", q.Bounds, s)
		log.Println(q.NW.Bounds, q.NW.InRange(s.Coords))
		log.Println(q.NE.Bounds, q.NE.InRange(s.Coords))
		log.Println(q.SW.Bounds, q.SW.InRange(s.Coords))
		log.Println(q.SE.Bounds, q.SE.InRange(s.Coords))
		return nil
	}
}

func (q *QuadTree) Add(pokemon Spawn) {
	if !q.full {
		q.children = append(q.children, pokemon)
		if len(q.children) > 15 {
			q.full = true
			q.NW = NewNWQuadTree(q)
			q.NE = NewNEQuadTree(q)
			q.SW = NewSWQuadTree(q)
			q.SE = NewSEQuadTree(q)
			for _, s := range q.children {
				sub := q.GetSubtree(s)
				sub.Add(s)
			}
			q.children = make([]Spawn, 0)
		}
	} else {
		sub := q.GetSubtree(pokemon)
		sub.Add(pokemon)
	}
}

func (q *QuadTree) Remove(pokemon Spawn) {
	if q.full {
		// is not a leaf
		sub := q.GetSubtree(pokemon)
		sub.Remove(pokemon)
	} else {
		// is leaf, ie: has the element to be removed
		for i, s := range q.children {
			if reflect.DeepEqual(pokemon, s) {
				// put last element here and delete
				q.children[i] = q.children[len(q.children)-1]
				q.children = q.children[:len(q.children)-1]
				break
			}
		}
	}
}

func (q *QuadTree) GetInRange(b Bounds) []Spawn {
	if q.Collides(b) {
		if q.full {
			ret := make([]Spawn, 0)
			ret = append(ret, q.NW.GetInRange(b)...)
			ret = append(ret, q.NE.GetInRange(b)...)
			ret = append(ret, q.SW.GetInRange(b)...)
			ret = append(ret, q.SE.GetInRange(b)...)
			return ret
		} else {
			return q.children
		}
	} else {
		return []Spawn{}
	}
}
