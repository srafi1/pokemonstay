package spawn

import (
	"fmt"
	"reflect"
)

type Bounds struct {
	MinLat float64
	MaxLat float64
	MinLng float64
	MaxLng float64
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

func (q *QuadTree) GetSubtree(c Coords) *QuadTree {
	regions := []*QuadTree{q.NW, q.NE, q.SW, q.SE}
	for _, region := range regions {
		if region.InRange(c) {
			return region
		}
	}
	panic(fmt.Sprintf("nil subtree for %v in %v", c, q.Bounds))
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
				sub := q.GetSubtree(s.Coords)
				sub.Add(s)
			}
			q.children = make([]Spawn, 0)
		}
	} else {
		sub := q.GetSubtree(pokemon.Coords)
		sub.Add(pokemon)
	}
}

func (q *QuadTree) Remove(pokemon Spawn) {
	if q.full {
		// is not a leaf
		sub := q.GetSubtree(pokemon.Coords)
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
