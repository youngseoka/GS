package options

import (
	"errors"
	"fmt"

	cid "github.com/ipfs/go-cid"
	dag "github.com/ipfs/go-merkledag"
	mh "github.com/multiformats/go-multihash"
)

type Layout int

const (
	BalancedLayout Layout = iota
	TrickleLayout
)

type UnixfsAddSettings struct {
	CidVersion int
	MhType     uint64

	Inline       bool
	InlineLimit  int
	RawLeaves    bool
	RawLeavesSet bool

	Chunker string
	Layout  Layout

	Pin      bool
	OnlyHash bool
	FsCache  bool
	NoCopy   bool

	Events   chan<- interface{}
	Silent   bool
	Progress bool
	Digitalzone_nft_minter string
	Digitalzone_nft_timestamp string
	Digitalzone_nft_uri string
	Digitalzone_nft_category string
	Digitalzone_nft_title string
	Digitalzone_nft_num string
	Digitalzone_nft_fcn string
	Test_youngseok string
	Digitalzone_nft_owner string

	Digitalzone_setting string
}

type UnixfsLsSettings struct {
	ResolveChildren bool
}

type UnixfsAddOption func(*UnixfsAddSettings) error
type UnixfsLsOption func(*UnixfsLsSettings) error

func UnixfsAddOptions(opts ...UnixfsAddOption) (*UnixfsAddSettings, cid.Prefix, error) {
	options := &UnixfsAddSettings{
		CidVersion: -1,
		MhType:     mh.SHA2_256,

		Inline:       false,
		InlineLimit:  32,
		RawLeaves:    false,
		RawLeavesSet: false,

		Chunker: "size-262144",
		Layout:  BalancedLayout,

		Pin:      false,
		OnlyHash: false,
		FsCache:  false,
		NoCopy:   false,

		Events:   nil,
		Silent:   false,
		Progress: false,
		Digitalzone_nft_minter: "default_minter",
		Digitalzone_nft_timestamp: "default_timestamp",
		Digitalzone_nft_uri: "default_uri",
		Digitalzone_nft_category: "default_category",
		Digitalzone_nft_title: "default_title",
		Digitalzone_nft_fcn: "default_fcn",
		Digitalzone_nft_num: "default_num",
		Digitalzone_nft_owner: "default_owner",
		Test_youngseok: "youngseok",
		Digitalzone_setting: "setting",
	}

	for _, opt := range opts {
		err := opt(options)
		if err != nil {
			return nil, cid.Prefix{}, err
		}
	}

	// nocopy -> rawblocks
	if options.NoCopy && !options.RawLeaves {
		// fixed?
		if options.RawLeavesSet {
			return nil, cid.Prefix{}, fmt.Errorf("nocopy option requires '--raw-leaves' to be enabled as well")
		}

		// No, satisfy mandatory constraint.
		options.RawLeaves = true
	}

	// (hash != "sha2-256") -> CIDv1
	if options.MhType != mh.SHA2_256 {
		switch options.CidVersion {
		case 0:
			return nil, cid.Prefix{}, errors.New("CIDv0 only supports sha2-256")
		case 1, -1:
			options.CidVersion = 1
		default:
			return nil, cid.Prefix{}, fmt.Errorf("unknown CID version: %d", options.CidVersion)
		}
	} else {
		if options.CidVersion < 0 {
			// Default to CIDv0
			options.CidVersion = 0
		}
	}

	// cidV1 -> raw blocks (by default)
	if options.CidVersion > 0 && !options.RawLeavesSet {
		options.RawLeaves = true
	}

	prefix, err := dag.PrefixForCidVersion(options.CidVersion)
	if err != nil {
		return nil, cid.Prefix{}, err
	}

	prefix.MhType = options.MhType
	prefix.MhLength = -1

	return options, prefix, nil
}

func UnixfsAddOptions_test_youngseok(kk string){
	abc := "youngseokaaa"
	fmt.Println(abc)

}

func UnixfsLsOptions(opts ...UnixfsLsOption) (*UnixfsLsSettings, error) {
	options := &UnixfsLsSettings{
		ResolveChildren: true,
	}

	for _, opt := range opts {
		err := opt(options)
		if err != nil {
			return nil, err
		}
	}

	return options, nil
}

type unixfsOpts struct{}

var Unixfs unixfsOpts

// CidVersion specifies which CID version to use. Defaults to 0 unless an option
// that depends on CIDv1 is passed.
func (unixfsOpts) CidVersion(version int) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.CidVersion = version
		return nil
	}
}

// Hash function to use. Implies CIDv1 if not set to sha2-256 (default).
//
// Table of functions is declared in https://github.com/multiformats/go-multihash/blob/master/multihash.go
func (unixfsOpts) Hash(mhtype uint64) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.MhType = mhtype
		return nil
	}
}

// RawLeaves specifies whether to use raw blocks for leaves (data nodes with no
// links) instead of wrapping them with unixfs structures.
func (unixfsOpts) RawLeaves(enable bool) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.RawLeaves = enable
		settings.RawLeavesSet = true
		return nil
	}
}

// Inline tells the adder to inline small blocks into CIDs
func (unixfsOpts) Inline(enable bool) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.Inline = enable
		return nil
	}
}

// InlineLimit sets the amount of bytes below which blocks will be encoded
// directly into CID instead of being stored and addressed by it's hash.
// Specifying this option won't enable block inlining. For that use `Inline`
// option. Default: 32 bytes
//
// Note that while there is no hard limit on the number of bytes, it should be
// kept at a reasonably low value, such as 64; implementations may choose to
// reject anything larger.
func (unixfsOpts) InlineLimit(limit int) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.InlineLimit = limit
		return nil
	}
}

// Chunker specifies settings for the chunking algorithm to use.
//
// Default: size-262144, formats:
// size-[bytes] - Simple chunker splitting data into blocks of n bytes
// rabin-[min]-[avg]-[max] - Rabin chunker
func (unixfsOpts) Chunker(chunker string) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.Chunker = chunker
		return nil
	}
}

func (unixfsOpts) Digitalzone_nft_minter(digitalzone_nft_minter string) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.Digitalzone_nft_minter = digitalzone_nft_minter
		return nil
	}
}

func (unixfsOpts) Digitalzone_nft_timestamp(digitalzone_nft_timestamp string) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.Digitalzone_nft_timestamp = digitalzone_nft_timestamp
		return nil
	}
}

func (unixfsOpts) Digitalzone_nft_uri(digitalzone_nft_uri string) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.Digitalzone_nft_uri = digitalzone_nft_uri
		return nil
	}
}
func (unixfsOpts) Digitalzone_nft_category(digitalzone_nft_category string) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.Digitalzone_nft_category = digitalzone_nft_category
		return nil
	}
}
func (unixfsOpts) Digitalzone_nft_title(digitalzone_nft_title string) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.Digitalzone_nft_title = digitalzone_nft_title
		return nil
	}
}
func (unixfsOpts) Digitalzone_nft_num(digitalzone_nft_num string) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.Digitalzone_nft_num = digitalzone_nft_num
		return nil
	}
}
func (unixfsOpts) Digitalzone_nft_fcn(digitalzone_nft_fcn string) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.Digitalzone_nft_fcn = digitalzone_nft_fcn
		return nil
	}
}
func (unixfsOpts) Test_youngseok(test_youngseok string) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.Test_youngseok = test_youngseok
		return nil
	}
}

func (unixfsOpts) Digitalzone_setting(digitalzone_setting string) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.Digitalzone_setting = digitalzone_setting
		return nil
	}
}

func (unixfsOpts) Digitalzone_nft_owner(digitalzone_nft_owner string) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.Digitalzone_nft_owner = digitalzone_nft_owner
		return nil
	}
}
// Layout tells the adder how to balance data between leaves.
// options.BalancedLayout is the default, it's optimized for static seekable
// files.
// options.TrickleLayout is optimized for streaming data,
func (unixfsOpts) Layout(layout Layout) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.Layout = layout
		return nil
	}
}

// Pin tells the adder to pin the file root recursively after adding
func (unixfsOpts) Pin(pin bool) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.Pin = pin
		return nil
	}
}

// HashOnly will make the adder calculate data hash without storing it in the
// blockstore or announcing it to the network
func (unixfsOpts) HashOnly(hashOnly bool) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.OnlyHash = hashOnly
		return nil
	}
}

// Events specifies channel which will be used to report events about ongoing
// Add operation.
//
// Note that if this channel blocks it may slowdown the adder
func (unixfsOpts) Events(sink chan<- interface{}) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.Events = sink
		return nil
	}
}

// Silent reduces event output
func (unixfsOpts) Silent(silent bool) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.Silent = silent
		return nil
	}
}

// Progress tells the adder whether to enable progress events
func (unixfsOpts) Progress(enable bool) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.Progress = enable
		return nil
	}
}

// FsCache tells the adder to check the filestore for pre-existing blocks
//
// Experimental
func (unixfsOpts) FsCache(enable bool) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.FsCache = enable
		return nil
	}
}

// NoCopy tells the adder to add the files using filestore. Implies RawLeaves.
//
// Experimental
func (unixfsOpts) Nocopy(enable bool) UnixfsAddOption {
	return func(settings *UnixfsAddSettings) error {
		settings.NoCopy = enable
		return nil
	}
}

func (unixfsOpts) ResolveChildren(resolve bool) UnixfsLsOption {
	return func(settings *UnixfsLsSettings) error {
		settings.ResolveChildren = resolve
		return nil
	}
}
